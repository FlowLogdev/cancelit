import Foundation
import Observation
import Supabase

@MainActor
@Observable
final class AppState {
  enum AuthPhase {
    case checking
    case signedOut
    case signedIn
  }

  var authPhase: AuthPhase = .checking
  var email: String = ""
  var dashboard = DashboardSnapshot.sample
  var subscriptions: [Subscription] = Subscription.samples
  var connectedItems: [PlaidItem] = []
  var detectedSubscriptions: [DetectedSubscription] = []
  var assistantMessages: [AssistantMessage] = [
    .init(role: .assistant, text: "Connect your bank or add subscriptions, then I can rank what to review first.")
  ]
  var toast: AppToast?

  let api = APIClient(baseURL: AppConfig.apiBaseURL)
  let auth: AuthService
  let billing = BillingService()

  init() {
    auth = AuthService()
  }

  func bootstrap() async {
    if let user = await auth.currentUser() {
      email = user.email ?? ""
      authPhase = .signedIn
      await billing.identify(userId: user.id)
      await refresh()
    } else {
      authPhase = .signedOut
    }
  }

  func signIn(email: String, password: String) async {
    do {
      try await auth.signIn(email: email, password: password)
      if let user = await auth.currentUser() {
        self.email = user.email ?? email
        await billing.identify(userId: user.id)
      } else {
        self.email = email
      }
      authPhase = .signedIn
      await refresh()
    } catch {
      toast = .error(error.localizedDescription)
    }
  }

  func signUp(email: String, password: String) async {
    do {
      try await auth.signUp(email: email, password: password)
      if let user = await auth.currentUser() {
        self.email = user.email ?? email
        await billing.identify(userId: user.id)
      } else {
        self.email = email
      }
      authPhase = .signedIn
      await refresh()
    } catch {
      toast = .error(error.localizedDescription)
    }
  }

  func signOut() async {
    do {
      try await auth.signOut()
      authPhase = .signedOut
      email = ""
    } catch {
      toast = .error(error.localizedDescription)
    }
  }

  func refresh() async {
    let token = await auth.accessToken
    let customerResult: CustomerEnvelope? = try? await api.get("/api/customers", token: token)
    let subscriptionResult: SubscriptionsEnvelope? = try? await api.get("/api/subscriptions", token: token)
    let plaid: PlaidAccountsEnvelope? = try? await api.get("/api/plaid/accounts", token: token)
    if let fetchedSubscriptions = subscriptionResult?.subscriptions {
      subscriptions = fetchedSubscriptions
    }
    connectedItems = plaid?.items ?? []
    dashboard = DashboardSnapshot.from(subscriptions: subscriptions, customer: customerResult?.customer)
  }

  func sendAssistantMessage(_ text: String) async {
    let message = AssistantMessage(role: .user, text: text)
    assistantMessages.append(message)

    do {
      let response: AssistantReply = try await api.post("/api/ai-chat", body: AssistantRequest(message: text), token: await auth.accessToken)
      assistantMessages.append(.init(role: .assistant, text: response.reply))
    } catch {
      assistantMessages.append(.init(role: .assistant, text: "I could not reach the assistant. Try again in a moment."))
    }
  }

  func requestCancellation(for subscription: Subscription) async -> CancellationRequestEnvelope? {
    do {
      let response: CancellationRequestEnvelope = try await api.post(
        "/api/cancellation-requests",
        body: CancellationRequest(subscriptionId: subscription.id),
        token: await auth.accessToken
      )
      toast = .success(response.message ?? "Cancellation guide created.")
      return response
    } catch {
      toast = .error(error.localizedDescription)
      return nil
    }
  }

  func handle(url: URL) {
    auth.handle(url: url)
  }
}
