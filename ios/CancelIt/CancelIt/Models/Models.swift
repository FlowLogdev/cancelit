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

  static let samples: [Subscription] = [
    .init(id: "netflix", name: "Netflix", amount: 22.99, billingCycle: "monthly", nextBillingDate: "2026-07-09", status: "active", category: "Streaming", websiteUrl: "https://www.netflix.com/cancelplan"),
    .init(id: "spotify", name: "Spotify", amount: 11.99, billingCycle: "monthly", nextBillingDate: "2026-07-14", status: "active", category: "Music", websiteUrl: "https://www.spotify.com/account/subscription/"),
    .init(id: "adobe", name: "Adobe Creative Cloud", amount: 59.99, billingCycle: "monthly", nextBillingDate: "2026-07-22", status: "pending_cancellation", category: "Software", websiteUrl: "https://account.adobe.com/plans")
  ]
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

struct CheckoutRequest: Encodable {
  let priceId: String
}
