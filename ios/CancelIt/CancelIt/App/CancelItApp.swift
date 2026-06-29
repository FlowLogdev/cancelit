import SwiftUI
import Supabase

@main
struct CancelItApp: App {
  @State private var appState = AppState()

  var body: some Scene {
    WindowGroup {
      RootView()
        .environment(appState)
        .preferredColorScheme(.dark)
        .onOpenURL { url in
          appState.handle(url: url)
        }
        .task {
          await appState.bootstrap()
        }
    }
  }
}

