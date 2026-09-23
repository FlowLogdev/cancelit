import SwiftUI

struct SubscriptionListView: View {
  @Environment(AppState.self) private var appState
  @State private var showPlaid = false
  @State private var subscriptionToRemove: Subscription?

  private var groupedSubscriptions: [(category: String, subscriptions: [Subscription])] {
    Dictionary(grouping: appState.insights.active, by: \.displayCategory)
      .map { (category: $0.key, subscriptions: $0.value.sorted { $0.monthlyAmount > $1.monthlyAmount }) }
      .sorted { $0.category < $1.category }
  }

  var body: some View {
    List {
      Section {
        MonthlySpendHeader(insights: appState.insights)
          .listRowInsets(EdgeInsets(top: 12, leading: 0, bottom: 8, trailing: 0))
          .listRowBackground(Color.clear)
      }
      Section {
        Button { showPlaid = true } label: {
          Label("Connect bank and scan", systemImage: "building.columns").foregroundStyle(.white)
        }
      } footer: { Text("Every Plaid result is reviewed before import. You can remove any tracked charge at any time.") }

      if groupedSubscriptions.isEmpty {
        Section { EmptyStateView(icon: "creditcard.trianglebadge.exclamationmark", title: "Nothing tracked", message: "Connect Plaid to build your personal recurring-spend plan.").listRowBackground(Color.clear) }
      } else {
        ForEach(groupedSubscriptions, id: \.category) { group in
          Section("\(group.category) · \(group.subscriptions.count)") {
            ForEach(group.subscriptions) { subscription in
              NavigationLink(value: subscription) { SubscriptionRow(subscription: subscription) }
                .swipeActions(edge: .trailing, allowsFullSwipe: false) {
                  Button(role: .destructive) { subscriptionToRemove = subscription } label: { Label("Remove", systemImage: "trash") }
                }
            }
          }
        }
      }
    }
    .scrollContentBackground(.hidden).background(CancelItTheme.background).navigationTitle("Subscriptions")
    .navigationDestination(for: Subscription.self) { SubscriptionDetailView(subscription: $0) }
    .sheet(isPresented: $showPlaid) { PlaidConnectView() }
    .alert("Remove from your tracker?", isPresented: Binding(get: { subscriptionToRemove != nil }, set: { if !$0 { subscriptionToRemove = nil } }), presenting: subscriptionToRemove) { subscription in
      Button("Remove", role: .destructive) { Task { _ = await appState.removeSubscription(subscription) } }
      Button("Keep", role: .cancel) {}
    } message: { subscription in
      Text("This removes \(subscription.name) from CancelIt. It does not cancel the merchant subscription.")
    }
  }
}

struct MonthlySpendHeader: View {
  let insights: SubscriptionInsights
  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Label("YOUR MONTHLY RECURRING SPEND", systemImage: "chart.line.uptrend.xyaxis").font(.caption.bold()).foregroundStyle(CancelItTheme.muted)
      Text(insights.monthlyTotal, format: .currency(code: "USD")).font(.system(size: 38, weight: .bold, design: .rounded))
      Text("≈ \(insights.annualTotal.formatted(.currency(code: "USD"))) a year across \(insights.active.count) active subscriptions").font(.subheadline).foregroundStyle(CancelItTheme.muted)
    }
    .frame(maxWidth: .infinity, alignment: .leading).padding(20)
    .background(LinearGradient(colors: [CancelItTheme.accent.opacity(0.9), CancelItTheme.surfaceAlt], startPoint: .topLeading, endPoint: .bottomTrailing))
    .clipShape(RoundedRectangle(cornerRadius: 18, style: .continuous))
  }
}

struct SubscriptionRow: View {
  let subscription: Subscription
  var body: some View {
    HStack(spacing: 14) {
      ZStack { Circle().fill(CancelItTheme.accent.opacity(0.16)); Image(systemName: categoryIcon).font(.headline).foregroundStyle(CancelItTheme.accent) }.frame(width: 42, height: 42)
      VStack(alignment: .leading, spacing: 4) { Text(subscription.name).font(.headline); Text("\(subscription.displayCategory) · \(subscription.billingCycle.capitalized)").font(.caption).foregroundStyle(CancelItTheme.muted) }
      Spacer()
      VStack(alignment: .trailing, spacing: 4) { Text(subscription.monthlyAmount, format: .currency(code: "USD")).font(.headline); Text("per month").font(.caption2).foregroundStyle(CancelItTheme.muted) }
    }.padding(.vertical, 6)
  }
  private var categoryIcon: String {
    let category = subscription.displayCategory.lowercased()
    if category.contains("stream") { return "play.rectangle.fill" }
    if category.contains("music") { return "music.note" }
    if category.contains("software") || category.contains("tech") { return "laptopcomputer" }
    if category.contains("health") || category.contains("fitness") { return "heart.fill" }
    return "creditcard.fill"
  }
}

struct SubscriptionDetailView: View {
  @Environment(AppState.self) private var appState
  let subscription: Subscription
  @State private var guide: CancellationGuide?
  @State private var isWorking = false
  @State private var confirmRemoval = false
  var body: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 20) {
        VStack(alignment: .leading, spacing: 8) { Text(subscription.name).font(.largeTitle.bold()); Text(subscription.monthlyAmount, format: .currency(code: "USD")).font(.title2.bold()).foregroundStyle(CancelItTheme.accent); Text("Monthly equivalent · \(subscription.billingCycle.capitalized) billing").foregroundStyle(CancelItTheme.muted) }
        Button { Task { await requestGuide() } } label: { HStack { if isWorking { ProgressView().tint(.white) }; Label("Get cancellation help", systemImage: "checklist") } }.buttonStyle(PrimaryButtonStyle()).disabled(isWorking)
        Button(role: .destructive) { confirmRemoval = true } label: { Label("Remove from my tracker", systemImage: "trash") }.buttonStyle(SecondaryButtonStyle())
        if let guide { CancellationGuideCard(guide: guide) }
      }.padding(20)
    }.background(CancelItTheme.background.ignoresSafeArea())
      .alert("Remove from your tracker?", isPresented: $confirmRemoval) { Button("Remove", role: .destructive) { Task { _ = await appState.removeSubscription(subscription) } }; Button("Keep", role: .cancel) {} } message: { Text("This does not cancel \(subscription.name) with the merchant.") }
  }
  private func requestGuide() async { isWorking = true; defer { isWorking = false }; guide = await appState.requestCancellation(for: subscription)?.guide }
}

private struct CancellationGuideCard: View {
  let guide: CancellationGuide
  var body: some View {
    VStack(alignment: .leading, spacing: 14) {
      Text("Cancellation guide").font(.headline)
      ForEach(Array(guide.instructions.enumerated()), id: \.offset) { index, step in
        HStack(alignment: .top, spacing: 12) { Text("\(index + 1)").font(.caption.bold()).frame(width: 24, height: 24).background(CancelItTheme.accent).clipShape(Circle()); Text(step).foregroundStyle(.white) }
      }
      if let urlString = guide.cancellationUrl, let url = URL(string: urlString) { Link("Open cancellation page", destination: url).buttonStyle(SecondaryButtonStyle()) }
    }.padding(16).background(CancelItTheme.surface).clipShape(RoundedRectangle(cornerRadius: 12))
  }
}
