import Foundation
import Supabase

@MainActor
final class AuthService {
  static let emailConfirmationURL = URL(string: "cancelit://auth-callback")!

  struct UserIdentity {
    let id: String
    let email: String?
  }

  private let client: SupabaseClient?

  private func activeSession() async -> Session? {
    guard let client else { return nil }

    if let session = try? await client.auth.session {
      return session
    }

    return try? await client.auth.refreshSession()
  }

  var accessToken: String? {
    get async {
      await activeSession()?.accessToken
    }
  }

  init() {
    if AppConfig.isSupabaseConfigured, let url = AppConfig.supabaseURL, let key = AppConfig.supabaseKey {
      client = SupabaseClient(
        supabaseURL: url,
        supabaseKey: key,
        options: SupabaseClientOptions(
          auth: .init(redirectToURL: Self.emailConfirmationURL)
        )
      )
    } else {
      client = nil
    }
  }

  func currentUserEmail() async -> String? {
    await currentUser()?.email
  }

  func currentUser() async -> UserIdentity? {
    guard let session = await activeSession() else { return nil }
    return UserIdentity(id: session.user.id.uuidString, email: session.user.email)
  }

  func signIn(email: String, password: String) async throws {
    guard let client else { throw CancelItError.configuration("Supabase is not configured. Create Config.xcconfig first.") }
    try await client.auth.signIn(email: email, password: password)
  }

  func signUp(email: String, password: String) async throws -> Bool {
    guard let client else { throw CancelItError.configuration("Supabase is not configured. Create Config.xcconfig first.") }
    let response = try await client.auth.signUp(
      email: email,
      password: password,
      redirectTo: Self.emailConfirmationURL
    )
    return response.session != nil
  }

  func signOut() async throws {
    try await client?.auth.signOut()
  }

  func handle(url: URL) async -> Bool {
    guard let client else { return false }
    do {
      _ = try await client.auth.session(from: url)
      return true
    } catch {
      return false
    }
  }
}
