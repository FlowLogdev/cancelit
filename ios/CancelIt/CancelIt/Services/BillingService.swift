import Foundation
import RevenueCat

struct RevenueCatPlan: Identifiable {
  let id: String
  let name: String
  let fallbackPrice: String
  let limit: String
  let isPopular: Bool
  fileprivate let package: Package?

  var displayPrice: String {
    package?.localizedPriceString ?? fallbackPrice
  }

  var isPurchasable: Bool {
    package != nil
  }
}

@MainActor
final class BillingService {
  enum PurchaseResult: Equatable {
    case purchased
    case cancelled
  }

  private struct PlanDefinition {
    let id: String
    let name: String
    let fallbackPrice: String
    let limit: String
    let isPopular: Bool
    let revenueCatPackageIdentifiers: [String]
  }

  private static let planDefinitions: [PlanDefinition] = [
    .init(
      id: "starter",
      name: "Starter",
      fallbackPrice: "$4.99",
      limit: "Track up to 10 subscriptions",
      isPopular: false,
      revenueCatPackageIdentifiers: ["starter", "minimum", "cancelit_starter"]
    ),
    .init(
      id: "plus",
      name: "Plus",
      fallbackPrice: "$12.99",
      limit: "Track up to 50 subscriptions with Plaid and the assistant",
      isPopular: true,
      revenueCatPackageIdentifiers: ["plus", "medium", "cancelit_plus"]
    ),
    .init(
      id: "unlimited",
      name: "Unlimited",
      fallbackPrice: "$19.99",
      limit: "Unlimited tracking for heavy subscription cleanup",
      isPopular: false,
      revenueCatPackageIdentifiers: ["unlimited", "maximum", "cancelit_unlimited"]
    ),
  ]

  static let fallbackPlans = planDefinitions.map { definition in
    RevenueCatPlan(
      id: definition.id,
      name: definition.name,
      fallbackPrice: definition.fallbackPrice,
      limit: definition.limit,
      isPopular: definition.isPopular,
      package: nil
    )
  }

  private var hasConfiguredPurchases = false

  init() {
    configureIfNeeded()
  }

  func configureIfNeeded() {
    guard !hasConfiguredPurchases else { return }
    guard AppConfig.isRevenueCatConfigured, let apiKey = AppConfig.revenueCatAPIKey else { return }

    #if DEBUG
    Purchases.logLevel = .debug
    #endif
    Purchases.configure(withAPIKey: apiKey)
    hasConfiguredPurchases = true
  }

  func identify(userId: String) async {
    guard hasConfiguredPurchases else { return }

    await withCheckedContinuation { continuation in
      Purchases.shared.logIn(userId) { _, _, _ in
        continuation.resume()
      }
    }
  }

  func loadPlans() async throws -> [RevenueCatPlan] {
    guard hasConfiguredPurchases else {
      throw CancelItError.configuration("RevenueCat is not configured. Add your public iOS SDK key first.")
    }

    let packages = try await currentPackages()

    return Self.planDefinitions.map { definition in
      let matchedPackage = packages.first { package in
        definition.revenueCatPackageIdentifiers.contains(package.identifier)
      }

      return RevenueCatPlan(
        id: definition.id,
        name: definition.name,
        fallbackPrice: definition.fallbackPrice,
        limit: definition.limit,
        isPopular: definition.isPopular,
        package: matchedPackage
      )
    }
  }

  func purchase(plan: RevenueCatPlan) async throws -> PurchaseResult {
    guard let package = plan.package else {
      throw CancelItError.configuration("RevenueCat is missing the \(plan.name) package in the current offering.")
    }

    return try await withCheckedThrowingContinuation { continuation in
      Purchases.shared.purchase(package: package) { _, _, error, userCancelled in
        if userCancelled {
          continuation.resume(returning: .cancelled)
        } else if let error {
          continuation.resume(throwing: error)
        } else {
          continuation.resume(returning: .purchased)
        }
      }
    }
  }

  func restorePurchases() async throws {
    guard hasConfiguredPurchases else {
      throw CancelItError.configuration("RevenueCat is not configured. Add your public iOS SDK key first.")
    }

    try await withCheckedThrowingContinuation { (continuation: CheckedContinuation<Void, Error>) in
      Purchases.shared.restorePurchases { _, error in
        if let error {
          continuation.resume(throwing: error)
        } else {
          continuation.resume(returning: ())
        }
      }
    }
  }

  private func currentPackages() async throws -> [Package] {
    try await withCheckedThrowingContinuation { continuation in
      Purchases.shared.getOfferings { offerings, error in
        if let error {
          continuation.resume(throwing: error)
          return
        }

        continuation.resume(returning: offerings?.current?.availablePackages ?? [])
      }
    }
  }
}
