import Foundation

enum AppConfig {
  static let apiBaseURL = configuredURL("API_BASE_URL") ?? URL(string: "https://cancelit.app")!
  static let supabaseURL = configuredURL("SUPABASE_URL")
  static let supabaseKey = configuredString("SUPABASE_PUBLISHABLE_KEY")
  static let revenueCatAPIKey = configuredString("REVENUECAT_API_KEY")

  static var isSupabaseConfigured: Bool {
    supabaseURL != nil && supabaseKey?.isEmpty == false && supabaseKey != "YOUR_SUPABASE_PUBLISHABLE_OR_ANON_KEY"
  }

  static var isRevenueCatConfigured: Bool {
    revenueCatAPIKey?.isEmpty == false && revenueCatAPIKey != "YOUR_REVENUECAT_PUBLIC_IOS_SDK_KEY"
  }

  private static func configuredString(_ key: String) -> String? {
    guard let value = Bundle.main.object(forInfoDictionaryKey: key) as? String else { return nil }
    let trimmed = value.trimmingCharacters(in: .whitespacesAndNewlines)
    return trimmed.isEmpty ? nil : trimmed
  }

  private static func configuredURL(_ key: String) -> URL? {
    guard let value = configuredString(key) else { return nil }
    return URL(string: value)
  }
}
