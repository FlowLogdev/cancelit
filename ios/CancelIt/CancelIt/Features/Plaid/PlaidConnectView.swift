import LinkKit
import SwiftUI

struct PlaidConnectView: View {
  @SwiftUI.Environment(AppState.self) private var appState
  @SwiftUI.Environment(\.dismiss) private var dismiss
  @State private var isConnecting = false
  @State private var isScanning = false
  @State private var linkSession: PlaidLinkSession?
  @State private var isPresentingLink = false
  @State private var selected: Set<String> = []
  @State private var notice: String?

  var body: some View {
    NavigationStack {
      ScrollView {
        VStack(alignment: .leading, spacing: 20) {
          VStack(alignment: .leading, spacing: 8) {
            Text("Connect your bank")
              .font(.largeTitle.bold())
            Text("CancelIt uses Plaid to find recurring charges. Plan limits are enforced by the backend before import.")
              .foregroundStyle(CancelItTheme.muted)
          }

          Button {
            Task { await connectBank() }
          } label: {
            HStack {
              if isConnecting { ProgressView().tint(.white) }
              Label("Start secure connection", systemImage: "lock.shield")
            }
          }
          .buttonStyle(PrimaryButtonStyle())
          .disabled(isConnecting)

          if !appState.connectedItems.isEmpty {
            VStack(alignment: .leading, spacing: 12) {
              Text("Connected institutions")
                .font(.headline)
              ForEach(appState.connectedItems) { item in
                HStack {
                  Label(item.institutionName ?? "Connected bank", systemImage: "building.columns")
                  Spacer()
                  Button("Scan") {
                    Task { await scan(item: item) }
                  }
                  .buttonStyle(.borderedProminent)
                }
                .padding(14)
                .background(CancelItTheme.surface)
                .clipShape(RoundedRectangle(cornerRadius: 8))
              }
            }
          }

          if isScanning {
            ProgressView("Scanning transactions")
              .tint(CancelItTheme.accent)
          }

          if let notice {
            Label(notice, systemImage: "exclamationmark.triangle")
              .font(.subheadline)
              .foregroundStyle(.orange)
          }

          ImportReviewView(selected: $selected)
        }
        .padding(20)
      }
      .background(CancelItTheme.background.ignoresSafeArea())
      .navigationTitle("Plaid")
      .navigationBarTitleDisplayMode(.inline)
      .toolbar {
        ToolbarItem(placement: .topBarTrailing) {
          Button("Done") { dismiss() }
        }
      }
    }
    .sheet(isPresented: $isPresentingLink) {
      if let linkSession {
        linkSession.sheet()
      }
    }
  }

  @MainActor
  private func connectBank() async {
    isConnecting = true
    defer { isConnecting = false }

    do {
      let response: PlaidLinkTokenEnvelope = try await appState.api.post(
        "/api/plaid/create-link-token",
        body: EmptyBody(),
        token: await appState.auth.accessToken
      )
      openPlaidLink(with: response.linkToken)
    } catch {
      let message = error.localizedDescription
      notice = message.contains("500") ? "The bank returned an internal error. Try again later or choose another institution." : message
    }
  }

  @MainActor
  private func openPlaidLink(with linkToken: String) {
    let configuration = LinkTokenConfiguration(
      token: linkToken,
      onSuccess: { success in
        Task { @MainActor in
          isPresentingLink = false
          await exchange(publicToken: success.publicToken, metadata: success.metadata)
        }
      },
      onExit: { exit in
        Task { @MainActor in
          isPresentingLink = false
          if let error = exit.error {
            notice = error.displayMessage ?? error.errorMessage
          }
        }
      },
      onEvent: nil,
      onLoad: nil
    )

    do {
      linkSession = try Plaid.createPlaidLinkSession(configuration: configuration)
      isPresentingLink = true
      notice = nil
    } catch {
      notice = error.localizedDescription
    }
  }

  @MainActor
  private func exchange(publicToken: String, metadata: SuccessMetadata) async {
    do {
      let response: PlaidExchangeEnvelope = try await appState.api.post(
        "/api/plaid/exchange-token",
        body: PlaidExchangeRequest(
          publicToken: publicToken,
          institution: PlaidInstitutionPayload(
            institutionId: metadata.institution.id,
            name: metadata.institution.name
          )
        ),
        token: await appState.auth.accessToken
      )
      notice = response.institution.map { "Connected to \($0)." } ?? "Bank connected successfully."
      await appState.refresh()
    } catch {
      notice = error.localizedDescription
    }
  }

  @MainActor
  private func scan(item: PlaidItem) async {
    isScanning = true
    defer { isScanning = false }

    do {
      let response: DetectedSubscriptionsEnvelope = try await appState.api.post(
        "/api/plaid/get-subscriptions",
        body: GetSubscriptionsRequest(itemId: item.itemId, refresh: true),
        token: await appState.auth.accessToken
      )
      appState.detectedSubscriptions = response.subscriptions
      selected = Set(response.subscriptions.map(\.id))
      notice = response.addOnNotice
    } catch {
      notice = error.localizedDescription
    }
  }
}

struct ImportReviewView: View {
  @SwiftUI.Environment(AppState.self) private var appState
  @Binding var selected: Set<String>
  @State private var isImporting = false

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Text("Detected subscriptions")
        .font(.headline)

      if appState.detectedSubscriptions.isEmpty {
        EmptyStateView(icon: "magnifyingglass", title: "Nothing ready to import", message: "Scan a connected bank to review recurring charges.")
      } else {
        ForEach(appState.detectedSubscriptions) { subscription in
          Toggle(isOn: Binding(
            get: { selected.contains(subscription.id) },
            set: { isOn in
              if isOn { selected.insert(subscription.id) } else { selected.remove(subscription.id) }
            }
          )) {
            VStack(alignment: .leading, spacing: 4) {
              Text(subscription.merchantName)
              Text(subscription.amount, format: .currency(code: "USD"))
                .font(.caption)
                .foregroundStyle(CancelItTheme.muted)
            }
          }
          .toggleStyle(.switch)
          .padding(14)
          .background(CancelItTheme.surface)
          .clipShape(RoundedRectangle(cornerRadius: 8))
        }

        Button {
          Task { await importSelected() }
        } label: {
          HStack {
            if isImporting { ProgressView().tint(.white) }
            Label("Import selected", systemImage: "tray.and.arrow.down")
          }
        }
        .buttonStyle(PrimaryButtonStyle())
        .disabled(isImporting || selected.isEmpty)
      }
    }
  }

  @MainActor
  private func importSelected() async {
    isImporting = true
    defer { isImporting = false }

    let chosen = appState.detectedSubscriptions.filter { selected.contains($0.id) }
    do {
      let response: ImportEnvelope = try await appState.api.post(
        "/api/plaid/import-subscriptions",
        body: ImportRequest(subscriptions: chosen.map(ImportSubscriptionPayload.init)),
        token: await appState.auth.accessToken
      )
      appState.toast = .success("Imported \(response.importedCount) subscriptions.")
      await appState.refresh()
    } catch {
      appState.toast = .error(error.localizedDescription)
    }
  }
}

struct EmptyBody: Encodable {}

struct PlaidLinkTokenEnvelope: Decodable {
  let linkToken: String
  let expiration: String
}

struct PlaidExchangeRequest: Encodable {
  let publicToken: String
  let institution: PlaidInstitutionPayload?

  enum CodingKeys: String, CodingKey {
    case publicToken = "public_token"
    case institution
  }
}

struct PlaidInstitutionPayload: Encodable {
  let institutionId: String?
  let name: String?

  enum CodingKeys: String, CodingKey {
    case institutionId = "institution_id"
    case name
  }
}

struct PlaidExchangeEnvelope: Decodable {
  let success: Bool
  let itemId: String
  let institution: String?
}

struct DetectedSubscriptionsEnvelope: Decodable {
  let subscriptions: [DetectedSubscription]
  let addOnNotice: String?
}

struct ImportRequest: Encodable {
  let subscriptions: [ImportSubscriptionPayload]
}

struct ImportSubscriptionPayload: Encodable {
  let merchantName: String
  let amount: Double
  let frequency: String
  let lastCharge: String?
  let nextBillingDate: String?
  let category: String?

  enum CodingKeys: String, CodingKey {
    case merchantName = "merchant_name"
    case amount
    case frequency
    case lastCharge = "last_payment_date"
    case nextBillingDate = "next_billing_date"
    case category
  }

  init(_ subscription: DetectedSubscription) {
    merchantName = subscription.merchantName
    amount = subscription.amount
    frequency = subscription.frequency
    lastCharge = subscription.lastPaymentDate
    nextBillingDate = subscription.nextBillingDate
    category = subscription.category
  }
}

struct ImportEnvelope: Decodable {
  let importedCount: Int
  let skippedCount: Int
}
