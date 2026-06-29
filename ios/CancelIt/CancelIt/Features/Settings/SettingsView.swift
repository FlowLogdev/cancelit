import SwiftUI
import UIKit

struct SettingsView: View {
  @Environment(AppState.self) private var appState
  @State private var showPricing = false

  var body: some View {
    List {
      Section("Profile") {
        Label(appState.email.isEmpty ? "Signed in" : appState.email, systemImage: "person.crop.circle")
        if appState.email.lowercased() == "support@flowlog.dev" {
          Label("Admin access", systemImage: "star.circle")
            .foregroundStyle(CancelItTheme.accent)
        }
      }

      Section("Billing") {
        Button {
          showPricing = true
        } label: {
          Label("Manage plan", systemImage: "creditcard")
        }
      }

      Section("Notifications") {
        Toggle("Renewal alerts", isOn: .constant(true))
        Toggle("Savings suggestions", isOn: .constant(true))
      }

      Section {
        Button(role: .destructive) {
          Task { await appState.signOut() }
        } label: {
          Label("Sign out", systemImage: "rectangle.portrait.and.arrow.right")
        }
      }
    }
    .scrollContentBackground(.hidden)
    .background(CancelItTheme.background)
    .navigationTitle("Settings")
    .sheet(isPresented: $showPricing) { PricingView() }
  }
}

struct PricingView: View {
  @Environment(AppState.self) private var appState
  @Environment(\.dismiss) private var dismiss

  var body: some View {
    NavigationStack {
      ScrollView {
        VStack(spacing: 14) {
          PricingCard(name: "Minimum", price: "$5", limit: "Track up to 10 subscriptions", priceId: "price_1TmQ5hHnnXzltziloT7UhPtI")
          PricingCard(name: "Medium", price: "$12", limit: "Track up to 50 subscriptions and use the assistant", priceId: "price_1TmQ6AHnnXzltzilBPBQ8dkp")
          PricingCard(name: "Maximum", price: "$24", limit: "Unlimited tracking for heavy subscription cleanup", priceId: "price_1TmQ6ZHnnXzltzileGjyuSoj")
        }
        .padding(20)
      }
      .background(CancelItTheme.background.ignoresSafeArea())
      .navigationTitle("Plans")
      .toolbar {
        ToolbarItem(placement: .topBarTrailing) {
          Button("Done") { dismiss() }
        }
      }
    }
  }
}

struct PricingCard: View {
  @Environment(AppState.self) private var appState
  let name: String
  let price: String
  let limit: String
  let priceId: String
  @State private var isOpening = false

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack {
        VStack(alignment: .leading) {
          Text(name)
            .font(.title3.bold())
          Text(limit)
            .font(.subheadline)
            .foregroundStyle(CancelItTheme.muted)
        }
        Spacer()
        Text(price)
          .font(.title.bold())
      }

      Button {
        Task { await openCheckout() }
      } label: {
        HStack {
          if isOpening { ProgressView().tint(.white) }
          Label("Choose \(name)", systemImage: "arrow.up.forward.app")
        }
      }
      .buttonStyle(PrimaryButtonStyle())
    }
    .padding(16)
    .background(CancelItTheme.surface)
    .clipShape(RoundedRectangle(cornerRadius: 8))
  }

  private func openCheckout() async {
    isOpening = true
    defer { isOpening = false }

    do {
      let response: CheckoutEnvelope = try await appState.api.post(
        "/api/create-checkout-session",
        body: CheckoutRequest(priceId: priceId),
        token: await appState.auth.accessToken
      )
      if let url = URL(string: response.url) {
        await UIApplication.shared.open(url)
      }
    } catch {
      appState.toast = .error(error.localizedDescription)
    }
  }
}

struct CheckoutEnvelope: Decodable {
  let url: String
}
