import SwiftUI

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
  @State private var plans = BillingService.fallbackPlans
  @State private var isLoading = false
  @State private var isRestoring = false
  @State private var billingMessage: String?

  var body: some View {
    NavigationStack {
      ScrollView {
        VStack(alignment: .leading, spacing: 14) {
          if let billingMessage {
            Text(billingMessage)
              .font(.footnote)
              .foregroundStyle(CancelItTheme.muted)
              .padding(12)
              .frame(maxWidth: .infinity, alignment: .leading)
              .background(CancelItTheme.surface)
              .clipShape(RoundedRectangle(cornerRadius: 8))
          }

          ForEach(plans) { plan in
            PricingCard(plan: plan)
          }
        }
        .padding(20)
      }
      .background(CancelItTheme.background.ignoresSafeArea())
      .navigationTitle("Plans")
      .task {
        await loadPlans()
      }
      .toolbar {
        ToolbarItem(placement: .topBarLeading) {
          Button {
            Task { await restorePurchases() }
          } label: {
            if isRestoring {
              ProgressView()
            } else {
              Text("Restore")
            }
          }
          .disabled(isRestoring)
        }
        ToolbarItem(placement: .topBarTrailing) {
          Button("Done") { dismiss() }
        }
      }
    }
  }

  private func loadPlans() async {
    guard !isLoading else { return }
    isLoading = true
    defer { isLoading = false }

    do {
      plans = try await appState.billing.loadPlans()
      billingMessage = plans.contains(where: \.isPurchasable) ? nil : "RevenueCat has no packages in the current offering yet."
    } catch {
      billingMessage = error.localizedDescription
    }
  }

  private func restorePurchases() async {
    guard !isRestoring else { return }
    isRestoring = true
    defer { isRestoring = false }

    do {
      try await appState.billing.restorePurchases()
      appState.toast = .success("Purchases restored.")
      await appState.refresh()
    } catch {
      appState.toast = .error(error.localizedDescription)
    }
  }
}

struct PricingCard: View {
  @Environment(AppState.self) private var appState
  let plan: RevenueCatPlan
  @State private var isOpening = false

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      HStack {
        VStack(alignment: .leading) {
          HStack(spacing: 8) {
            Text(plan.name)
              .font(.title3.bold())
            if plan.isPopular {
              Text("Popular")
                .font(.caption.bold())
                .padding(.horizontal, 8)
                .padding(.vertical, 4)
                .background(CancelItTheme.accent.opacity(0.16))
                .foregroundStyle(CancelItTheme.accent)
                .clipShape(Capsule())
            }
          }
          Text(plan.limit)
            .font(.subheadline)
            .foregroundStyle(CancelItTheme.muted)
          if !plan.isPurchasable {
            Text("Waiting for RevenueCat package")
              .font(.caption)
              .foregroundStyle(CancelItTheme.muted)
          }
        }
        Spacer()
        VStack(alignment: .trailing, spacing: 2) {
          Text(plan.displayPrice)
            .font(.title3.bold())
          Text("/mo")
            .font(.caption)
            .foregroundStyle(CancelItTheme.muted)
        }
      }

      Button {
        Task { await purchasePlan() }
      } label: {
        HStack {
          if isOpening { ProgressView().tint(.white) }
          Label("Choose \(plan.name)", systemImage: "checkmark.seal")
        }
      }
      .buttonStyle(PrimaryButtonStyle())
      .disabled(isOpening || !plan.isPurchasable)
    }
    .padding(16)
    .background(CancelItTheme.surface)
    .clipShape(RoundedRectangle(cornerRadius: 8))
  }

  private func purchasePlan() async {
    isOpening = true
    defer { isOpening = false }

    do {
      let result = try await appState.billing.purchase(plan: plan)
      if result == .purchased {
        appState.toast = .success("\(plan.name) is active.")
        await appState.refresh()
      }
    } catch {
      appState.toast = .error(error.localizedDescription)
    }
  }
}
