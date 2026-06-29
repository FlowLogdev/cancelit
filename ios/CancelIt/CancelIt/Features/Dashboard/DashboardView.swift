import SwiftUI

struct DashboardView: View {
  @Environment(AppState.self) private var appState
  @State private var showPricing = false
  @State private var showPlaid = false

  var body: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 20) {
        VStack(alignment: .leading, spacing: 8) {
          Text("Dashboard")
            .font(.largeTitle.bold())
          Text("A calm snapshot of what is renewing and where you can save.")
            .foregroundStyle(CancelItTheme.muted)
        }

        LazyVGrid(columns: [GridItem(.flexible()), GridItem(.flexible())], spacing: 12) {
          MetricTile(title: "Money saved", value: "$\(Int(appState.dashboard.saved))", icon: "banknote", tint: .green)
          MetricTile(title: "Tracked", value: "\(appState.dashboard.added)", icon: "rectangle.stack", tint: CancelItTheme.accent)
          MetricTile(title: "Cancelled", value: "\(appState.dashboard.cancelled)", icon: "checkmark.seal", tint: .cyan)
          MetricTile(title: "Upcoming", value: "\(appState.dashboard.upcoming.count)", icon: "calendar", tint: .orange)
        }

        HStack(spacing: 12) {
          Button { showPlaid = true } label: {
            Label("Connect Bank", systemImage: "building.columns")
          }
          .buttonStyle(PrimaryButtonStyle())

          Button { showPricing = true } label: {
            Label("Plans", systemImage: "crown")
          }
          .buttonStyle(SecondaryButtonStyle())
        }

        VStack(alignment: .leading, spacing: 12) {
          Text("Upcoming renewals")
            .font(.headline)

          if appState.dashboard.upcoming.isEmpty {
            EmptyStateView(icon: "calendar.badge.plus", title: "No renewals yet", message: "Add subscriptions manually or connect your bank to start tracking.")
          } else {
            ForEach(appState.dashboard.upcoming) { subscription in
              NavigationLink(value: subscription) {
                SubscriptionRow(subscription: subscription)
              }
            }
          }
        }
      }
      .padding(20)
    }
    .background(CancelItTheme.background.ignoresSafeArea())
    .navigationDestination(for: Subscription.self) { subscription in
      SubscriptionDetailView(subscription: subscription)
    }
    .sheet(isPresented: $showPricing) { PricingView() }
    .sheet(isPresented: $showPlaid) { PlaidConnectView() }
    .refreshable {
      await appState.refresh()
    }
  }
}

