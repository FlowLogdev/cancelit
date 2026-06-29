import SwiftUI

struct SubscriptionListView: View {
  @Environment(AppState.self) private var appState
  @State private var showPlaid = false

  var body: some View {
    List {
      Section {
        Button {
          showPlaid = true
        } label: {
          Label("Connect bank and scan", systemImage: "building.columns")
        }
      }

      Section("Subscriptions") {
        if appState.subscriptions.isEmpty {
          EmptyStateView(icon: "creditcard.trianglebadge.exclamationmark", title: "Nothing tracked", message: "Connect Plaid or add subscriptions from the web dashboard.")
            .listRowBackground(Color.clear)
        } else {
          ForEach(appState.subscriptions) { subscription in
            NavigationLink(value: subscription) {
              SubscriptionRow(subscription: subscription)
            }
          }
        }
      }
    }
    .scrollContentBackground(.hidden)
    .background(CancelItTheme.background)
    .navigationTitle("Subscriptions")
    .navigationDestination(for: Subscription.self) { subscription in
      SubscriptionDetailView(subscription: subscription)
    }
    .sheet(isPresented: $showPlaid) { PlaidConnectView() }
  }
}

struct SubscriptionRow: View {
  let subscription: Subscription

  var body: some View {
    HStack(spacing: 14) {
      ZStack {
        Circle().fill(CancelItTheme.accent.opacity(0.16))
        Text(String(subscription.name.prefix(1)))
          .font(.headline)
          .foregroundStyle(CancelItTheme.accent)
      }
      .frame(width: 42, height: 42)

      VStack(alignment: .leading, spacing: 4) {
        Text(subscription.name)
          .font(.headline)
        Text(subscription.category ?? subscription.billingCycle.capitalized)
          .font(.caption)
          .foregroundStyle(CancelItTheme.muted)
      }

      Spacer()

      VStack(alignment: .trailing, spacing: 4) {
        Text(subscription.amount, format: .currency(code: "USD"))
          .font(.headline)
        Text(subscription.status.replacingOccurrences(of: "_", with: " ").capitalized)
          .font(.caption2)
          .foregroundStyle(subscription.status == "pending_cancellation" ? .orange : CancelItTheme.muted)
      }
    }
    .padding(.vertical, 6)
  }
}

struct SubscriptionDetailView: View {
  @Environment(AppState.self) private var appState
  let subscription: Subscription
  @State private var guide: CancellationGuide?
  @State private var isWorking = false

  var body: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 20) {
        VStack(alignment: .leading, spacing: 8) {
          Text(subscription.name)
            .font(.largeTitle.bold())
          Text(subscription.amount, format: .currency(code: "USD"))
            .font(.title2.bold())
            .foregroundStyle(CancelItTheme.accent)
          Text("\(subscription.billingCycle.capitalized) billing")
            .foregroundStyle(CancelItTheme.muted)
        }

        Button {
          Task { await requestGuide() }
        } label: {
          HStack {
            if isWorking { ProgressView().tint(.white) }
            Label("Get cancellation help", systemImage: "checklist")
          }
        }
        .buttonStyle(PrimaryButtonStyle())
        .disabled(isWorking)

        if let guide {
          VStack(alignment: .leading, spacing: 14) {
            Text("Cancellation guide")
              .font(.headline)
            ForEach(Array(guide.instructions.enumerated()), id: \.offset) { index, step in
              HStack(alignment: .top, spacing: 12) {
                Text("\(index + 1)")
                  .font(.caption.bold())
                  .frame(width: 24, height: 24)
                  .background(CancelItTheme.accent)
                  .clipShape(Circle())
                Text(step)
                  .foregroundStyle(.white)
              }
            }
            if let urlString = guide.cancellationUrl, let url = URL(string: urlString) {
              Link("Open cancellation page", destination: url)
                .buttonStyle(SecondaryButtonStyle())
            }
          }
          .padding(16)
          .background(CancelItTheme.surface)
          .clipShape(RoundedRectangle(cornerRadius: 8))
        }
      }
      .padding(20)
    }
    .background(CancelItTheme.background.ignoresSafeArea())
  }

  private func requestGuide() async {
    isWorking = true
    defer { isWorking = false }

    let response = await appState.requestCancellation(for: subscription)
    guide = response?.guide
  }
}

