import Foundation
import Supabase

@MainActor
final class AuthService {
  struct UserIdentity {
    let id: String
    let email: String?
  }

  private let client: SupabaseClient?

  var accessToken: String? {
    get async {
      try? await client?.auth.session.accessToken
    }
  }

  init() {
    if AppConfig.isSupabaseConfigured, let url = AppConfig.supabaseURL, let key = AppConfig.supabaseKey {
      client = SupabaseClient(supabaseURL: url, supabaseKey: key)
    } else {
      client = nil
    }
  }

  func currentUserEmail() async -> String? {
    await currentUser()?.email
  }

  func currentUser() async -> UserIdentity? {
    guard let client else { return nil }
    guard let user = try? await client.auth.user() else { return nil }
    return UserIdentity(id: user.id.uuidString, email: user.email)
  }

  func signIn(email: String, password: String) async throws {
    guard let client else { throw CancelItError.configuration("Supabase is not configured. Create Config.xcconfig first.") }
    try await client.auth.signIn(email: email, password: password)
  }

  func signUp(email: String, password: String) async throws {
    guard let client else { throw CancelItError.configuration("Supabase is not configured. Create Config.xcconfig first.") }
    try await client.auth.signUp(email: email, password: password)
  }

  func signOut() async throws {
    try await client?.auth.signOut()
  }

  func handle(url: URL) {
    guard let client else { return }
    Task {
      _ = try? await client.auth.session(from: url)
    }
  }
}
