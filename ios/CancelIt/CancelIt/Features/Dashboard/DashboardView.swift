import Charts
import SwiftUI

struct DashboardView: View {
  @Environment(AppState.self) private var appState
  @State private var showPricing = false
  @State private var showPlaid = false

  var body: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 20) {
        VStack(alignment: .leading, spacing: 8) {
          Text("Spend intelligence").font(.largeTitle.bold())
          Text("Your recurring spend, organized into decisions—not just a list.").foregroundStyle(CancelItTheme.muted)
        }

        MonthlySpendHeader(insights: appState.insights)

        HStack(spacing: 12) {
          Button { showPlaid = true } label: { Label("Scan bank", systemImage: "building.columns") }.buttonStyle(PrimaryButtonStyle())
          Button { showPricing = true } label: { Label("Plans", systemImage: "crown") }.buttonStyle(SecondaryButtonStyle())
        }

        CategorySpendCard(insights: appState.insights)
        SavingsCoachCard(insights: appState.insights)

        VStack(alignment: .leading, spacing: 12) {
          Text("Upcoming renewals").font(.headline)
          if appState.insights.upcoming.isEmpty {
            EmptyStateView(icon: "calendar.badge.plus", title: "No renewals yet", message: "Scan a connected bank to find recurring charges.")
          } else {
            ForEach(appState.insights.upcoming) { subscription in
              NavigationLink(value: subscription) { SubscriptionRow(subscription: subscription) }
            }
          }
        }
      }.padding(20)
    }
    .background(CancelItTheme.background.ignoresSafeArea())
    .navigationDestination(for: Subscription.self) { SubscriptionDetailView(subscription: $0) }
    .sheet(isPresented: $showPricing) { PricingView() }
    .sheet(isPresented: $showPlaid) { PlaidConnectView() }
    .refreshable { await appState.refresh() }
  }
}

private struct CategorySpendCard: View {
  let insights: SubscriptionInsights
  private let palette: [Color] = [CancelItTheme.accent, .orange, .cyan, .purple, .green, .pink]

  var body: some View {
    VStack(alignment: .leading, spacing: 16) {
      HStack { Text("Where your money goes").font(.headline); Spacer(); Text("monthly").font(.caption).foregroundStyle(CancelItTheme.muted) }
      if insights.categories.isEmpty {
        Text("Your category breakdown will appear after your first import.").foregroundStyle(CancelItTheme.muted)
      } else {
        Chart(insights.categories) { category in
          SectorMark(angle: .value("Monthly spend", category.monthlyAmount), innerRadius: .ratio(0.62), angularInset: 2)
            .foregroundStyle(by: .value("Category", category.name))
        }
        .chartForegroundStyleScale(range: palette)
        .chartLegend(.hidden)
        .frame(height: 190)
        .overlay { VStack(spacing: 2) { Text("TOTAL").font(.caption2.bold()).foregroundStyle(CancelItTheme.muted); Text(insights.monthlyTotal, format: .currency(code: "USD")).font(.title3.bold()) } }
        VStack(spacing: 10) {
          ForEach(Array(insights.categories.enumerated()), id: \.element.id) { index, category in
            HStack(spacing: 8) {
              Circle().fill(palette[index % palette.count]).frame(width: 8, height: 8)
              Text(category.name).font(.subheadline)
              Spacer()
              Text(category.monthlyAmount, format: .currency(code: "USD")).font(.subheadline.bold())
              Text("\(category.subscriptionCount)").font(.caption).foregroundStyle(CancelItTheme.muted)
            }
          }
        }
      }
    }.padding(18).background(CancelItTheme.surface).clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous)).overlay(RoundedRectangle(cornerRadius: 16).stroke(CancelItTheme.border))
  }
}

private struct SavingsCoachCard: View {
  let insights: SubscriptionInsights
  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Label("CANCELIT SAVINGS COACH", systemImage: "sparkles").font(.caption.bold()).foregroundStyle(.yellow)
      Text("Your next best move").font(.headline)
      ForEach(insights.savingsTips, id: \.self) { tip in
        HStack(alignment: .top, spacing: 10) { Image(systemName: "checkmark.circle.fill").foregroundStyle(.green); Text(tip).font(.subheadline).foregroundStyle(CancelItTheme.muted) }
      }
    }.padding(18).background(CancelItTheme.surfaceAlt).clipShape(RoundedRectangle(cornerRadius: 16, style: .continuous))
  }
}
