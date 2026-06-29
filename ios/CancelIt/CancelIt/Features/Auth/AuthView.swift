import SwiftUI

struct AuthView: View {
  @Environment(AppState.self) private var appState
  @State private var email = ""
  @State private var password = ""
  @State private var isSignUp = false
  @State private var isWorking = false

  var body: some View {
    ScrollView {
      VStack(alignment: .leading, spacing: 28) {
        VStack(alignment: .leading, spacing: 12) {
          Image(systemName: "scissors.circle.fill")
            .font(.system(size: 56))
            .foregroundStyle(CancelItTheme.accent)
          Text("CancelIt")
            .font(.system(size: 42, weight: .bold, design: .rounded))
          Text("Find recurring charges, understand what they cost, and get a clear path to cancel what you no longer need.")
            .font(.body)
            .foregroundStyle(CancelItTheme.muted)
        }
        .padding(.top, 48)

        VStack(spacing: 14) {
          TextField("Email", text: $email)
            .textContentType(.emailAddress)
            .keyboardType(.emailAddress)
            .textInputAutocapitalization(.never)
            .padding(14)
            .background(CancelItTheme.surface)
            .clipShape(RoundedRectangle(cornerRadius: 8))

          SecureField("Password", text: $password)
            .textContentType(isSignUp ? .newPassword : .password)
            .padding(14)
            .background(CancelItTheme.surface)
            .clipShape(RoundedRectangle(cornerRadius: 8))

          Button {
            Task { await submit() }
          } label: {
            HStack {
              if isWorking { ProgressView().tint(.white) }
              Text(isSignUp ? "Create account" : "Sign in")
            }
          }
          .buttonStyle(PrimaryButtonStyle())
          .disabled(isWorking || email.isEmpty || password.count < 6)

          Button(isSignUp ? "I already have an account" : "Create a new account") {
            isSignUp.toggle()
          }
          .foregroundStyle(.white)
        }

        VStack(alignment: .leading, spacing: 12) {
          Label("Connect Plaid securely", systemImage: "lock.shield")
          Label("Track plan limits by tier", systemImage: "slider.horizontal.3")
          Label("Use guided cancellation help", systemImage: "checklist")
        }
        .font(.subheadline)
        .foregroundStyle(CancelItTheme.muted)
      }
      .padding(24)
    }
    .background(CancelItTheme.background.ignoresSafeArea())
  }

  private func submit() async {
    isWorking = true
    defer { isWorking = false }

    if isSignUp {
      await appState.signUp(email: email, password: password)
    } else {
      await appState.signIn(email: email, password: password)
    }
  }
}

