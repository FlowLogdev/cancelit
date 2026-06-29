import SwiftUI

struct RootView: View {
  @Environment(AppState.self) private var appState

  var body: some View {
    Group {
      switch appState.authPhase {
      case .checking:
        ProgressView()
          .tint(CancelItTheme.accent)
          .frame(maxWidth: .infinity, maxHeight: .infinity)
          .background(CancelItTheme.background)
      case .signedOut:
        AuthView()
      case .signedIn:
        AppShellView()
      }
    }
    .tint(CancelItTheme.accent)
    .alert(item: Binding(get: { appState.toast }, set: { appState.toast = $0 })) { toast in
      Alert(title: Text(toast.isError ? "Something went wrong" : "Done"), message: Text(toast.title))
    }
  }
}

enum AppTab: String, CaseIterable, Identifiable {
  case dashboard
  case subscriptions
  case assistant
  case settings

  var id: String { rawValue }

  var title: String {
    switch self {
    case .dashboard: "Dashboard"
    case .subscriptions: "Subscriptions"
    case .assistant: "Assistant"
    case .settings: "Settings"
    }
  }

  var icon: String {
    switch self {
    case .dashboard: "gauge.with.dots.needle.bottom.50percent"
    case .subscriptions: "creditcard"
    case .assistant: "sparkles"
    case .settings: "gearshape"
    }
  }
}

struct AppShellView: View {
  @State private var selectedTab: AppTab = .dashboard

  var body: some View {
    TabView(selection: $selectedTab) {
      NavigationStack { DashboardView() }
        .tabItem { Label(AppTab.dashboard.title, systemImage: AppTab.dashboard.icon) }
        .tag(AppTab.dashboard)

      NavigationStack { SubscriptionListView() }
        .tabItem { Label(AppTab.subscriptions.title, systemImage: AppTab.subscriptions.icon) }
        .tag(AppTab.subscriptions)

      NavigationStack { AssistantView() }
        .tabItem { Label(AppTab.assistant.title, systemImage: AppTab.assistant.icon) }
        .tag(AppTab.assistant)

      NavigationStack { SettingsView() }
        .tabItem { Label(AppTab.settings.title, systemImage: AppTab.settings.icon) }
        .tag(AppTab.settings)
    }
    .background(CancelItTheme.background)
  }
}

