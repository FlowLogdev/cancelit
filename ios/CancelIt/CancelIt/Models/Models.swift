import Foundation

struct DashboardSnapshot {
  var saved: Double
  var added: Int
  var cancelled: Int
  var upcoming: [Subscription]

  static let sample = DashboardSnapshot(saved: 126, added: 8, cancelled: 3, upcoming: Array(Subscription.samples.prefix(2)))

  static func from(subscriptions: [Subscription], customer: Customer?) -> DashboardSnapshot {
    let cancelled = subscriptions.filter { $0.status == "cancelled" }.count
    let active = subscriptions.filter { $0.status != "cancelled" }
    return DashboardSnapshot(saved: Double(cancelled) * 18, added: subscriptions.count, cancelled: cancelled, upcoming: Array(active.prefix(3)))
  }
}

struct Subscription: Identifiable, Codable, Hashable {
  let id: String
  let name: String
  let amount: Double
  let billingCycle: String
  let nextBillingDate: String?
  let status: String
  let category: String?
  let websiteUrl: String?

  var isActive: Bool { status != "cancelled" && status != "removed" }

  var monthlyAmount: Double {
    switch billingCycle.lowercased() {
    case "weekly": amount * 52 / 12
    case "yearly", "annual", "annually": amount / 12
    case "quarterly": amount / 3
    case "biweekly": amount * 26 / 12
    default: amount
    }
  }

  var displayCategory: String {
    let value = category?.trimmingCharacters(in: .whitespacesAndNewlines) ?? ""
    return value.isEmpty ? "Other" : value
  }

  static let samples: [Subscription] = [
    .init(id: "netflix", name: "Netflix", amount: 22.99, billingCycle: "monthly", nextBillingDate: "2026-07-09", status: "active", category: "Streaming", websiteUrl: "https://www.netflix.com/cancelplan"),
    .init(id: "spotify", name: "Spotify", amount: 11.99, billingCycle: "monthly", nextBillingDate: "2026-07-14", status: "active", category: "Music", websiteUrl: "https://www.spotify.com/account/subscription/"),
    .init(id: "adobe", name: "Adobe Creative Cloud", amount: 59.99, billingCycle: "monthly", nextBillingDate: "2026-07-22", status: "pending_cancellation", category: "Software", websiteUrl: "https://account.adobe.com/plans")
  ]
}

struct CategorySpend: Identifiable, Hashable {
  let name: String
  let monthlyAmount: Double
  let subscriptionCount: Int

  var id: String { name }
}

struct SubscriptionInsights {
  let active: [Subscription]
  let monthlyTotal: Double
  let annualTotal: Double
  let categories: [CategorySpend]
  let topSubscription: Subscription?
  let upcoming: [Subscription]

  static func from(_ subscriptions: [Subscription]) -> SubscriptionInsights {
    let active = subscriptions.filter(\.isActive).sorted { $0.monthlyAmount > $1.monthlyAmount }
    let grouped = Dictionary(grouping: active, by: \.displayCategory)
      .map { name, items in
        CategorySpend(
          name: name,
          monthlyAmount: items.reduce(0) { $0 + $1.monthlyAmount },
          subscriptionCount: items.count
        )
      }
      .sorted { $0.monthlyAmount > $1.monthlyAmount }

    let dated = active.sorted { ($0.nextBillingDate ?? "9999-12-31") < ($1.nextBillingDate ?? "9999-12-31") }
    return SubscriptionInsights(
      active: active,
      monthlyTotal: active.reduce(0) { $0 + $1.monthlyAmount },
      annualTotal: active.reduce(0) { $0 + $1.monthlyAmount * 12 },
      categories: grouped,
      topSubscription: active.first,
      upcoming: Array(dated.prefix(3))
    )
  }

  var savingsTips: [String] {
    guard !active.isEmpty else {
      return ["Connect Plaid to create a personal savings plan from your recurring charges."]
    }

    var tips: [String] = []
    if let topSubscription {
      tips.append("Review \(topSubscription.name) first — it is your largest recurring cost at \(topSubscription.monthlyAmount.formatted(.currency(code: "USD"))) per month.")
    }
    if categories.count > 1, let biggestCategory = categories.first {
      let categoryShare = (biggestCategory.monthlyAmount / max(monthlyTotal, 1)).formatted(.percent.precision(.fractionLength(0)))
      tips.append("\(biggestCategory.name) accounts for \(categoryShare) of your monthly spend. Keep one service you truly use and pause the rest.")
    }
    if active.count >= 4 {
      tips.append("Try a 30-day subscription freeze: remove or pause one low-use service and keep the saving in a separate goal.")
    }
    return tips
  }
}

struct DetectedSubscription: Identifiable, Codable, Hashable {
  let id: String
  let merchantName: String
  let amount: Double
  let frequency: String
  let lastPaymentDate: String?
  let nextBillingDate: String?
  let category: String?
  let confidence: String?
}

struct PlaidItem: Identifiable, Codable, Hashable {
  let id: String
  let itemId: String
  let institutionName: String?
  let status: String?
}

struct Customer: Codable {
  let subscriptionTier: String?
  let subscriptionStatus: String?
}

struct CustomerEnvelope: Codable {
  let customer: Customer?
}

struct SubscriptionsEnvelope: Codable {
  let subscriptions: [Subscription]
}

struct PlaidAccountsEnvelope: Codable {
  let items: [PlaidItem]
}

struct AssistantReply: Codable {
  let reply: String
}

struct CancellationGuide: Codable, Hashable {
  let cancellationUrl: String?
  let instructions: [String]
}

struct CancellationRequestEnvelope: Codable {
  let guide: CancellationGuide
  let message: String?
}

struct AssistantMessage: Identifiable, Hashable {
  enum Role {
    case user
    case assistant
  }

  let id = UUID()
  let role: Role
  let text: String
}

struct AppToast: Identifiable {
  let id = UUID()
  let title: String
  let isError: Bool

  static func success(_ title: String) -> AppToast { .init(title: title, isError: false) }
  static func error(_ title: String) -> AppToast { .init(title: title, isError: true) }
}

struct AssistantRequest: Encodable {
  let message: String
}

struct CancellationRequest: Encodable {
  let subscriptionId: String
}

struct GetSubscriptionsRequest: Encodable {
  let itemId: String
  let refresh: Bool
}
