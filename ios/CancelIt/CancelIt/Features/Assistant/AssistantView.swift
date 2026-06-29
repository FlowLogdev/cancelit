import SwiftUI

struct AssistantView: View {
  @Environment(AppState.self) private var appState
  @State private var draft = ""
  @State private var isSending = false

  var body: some View {
    VStack(spacing: 0) {
      ScrollViewReader { proxy in
        ScrollView {
          LazyVStack(spacing: 12) {
            ForEach(appState.assistantMessages) { message in
              AssistantBubble(message: message)
                .id(message.id)
            }
          }
          .padding(16)
        }
        .onChange(of: appState.assistantMessages.count) {
          if let last = appState.assistantMessages.last {
            proxy.scrollTo(last.id, anchor: .bottom)
          }
        }
      }

      HStack(spacing: 10) {
        TextField("Ask how to save money", text: $draft, axis: .vertical)
          .lineLimit(1...4)
          .padding(12)
          .background(CancelItTheme.surface)
          .clipShape(RoundedRectangle(cornerRadius: 8))

        Button {
          Task { await send() }
        } label: {
          Image(systemName: isSending ? "hourglass" : "arrow.up")
            .font(.headline)
            .frame(width: 42, height: 42)
        }
        .background(CancelItTheme.accent)
        .foregroundStyle(.white)
        .clipShape(Circle())
        .disabled(draft.trimmingCharacters(in: .whitespacesAndNewlines).isEmpty || isSending)
      }
      .padding(16)
      .background(CancelItTheme.background)
    }
    .background(CancelItTheme.background.ignoresSafeArea())
    .navigationTitle("Assistant")
  }

  private func send() async {
    let text = draft.trimmingCharacters(in: .whitespacesAndNewlines)
    guard !text.isEmpty else { return }
    draft = ""
    isSending = true
    defer { isSending = false }
    await appState.sendAssistantMessage(text)
  }
}

struct AssistantBubble: View {
  let message: AssistantMessage

  var body: some View {
    HStack {
      if message.role == .user { Spacer(minLength: 44) }
      Text(message.text)
        .padding(14)
        .background(message.role == .user ? CancelItTheme.accent : CancelItTheme.surface)
        .foregroundStyle(.white)
        .clipShape(RoundedRectangle(cornerRadius: 8))
      if message.role == .assistant { Spacer(minLength: 44) }
    }
  }
}

