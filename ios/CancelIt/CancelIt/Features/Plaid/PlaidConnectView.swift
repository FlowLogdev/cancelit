import SwiftUI

struct PlaidConnectView: View {
  @Environment(AppState.self) private var appState
  @Environment(\.dismiss) private var dismiss
  @State private var isConnecting = false
  @State private var isScanning = false
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
  }

  private func connectBank() async {
    isConnecting = true
    defer { isConnecting = false }

    do {
      let _: PlaidLinkTokenEnvelope = try await appState.api.post(
        "/api/plaid/create-link-token",
        body: EmptyBody(),
        token: await appState.auth.accessToken
      )
      notice = "Secure bank connection prepared. If the Plaid sheet does not appear, check the iOS redirect settings and try again."
    } catch {
      let message = error.localizedDescription
      notice = message.contains("500") ? "The bank returned an internal error. Try again later or choose another institution." : message
    }
  }

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
  @Environment(AppState.self) private var appState
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
