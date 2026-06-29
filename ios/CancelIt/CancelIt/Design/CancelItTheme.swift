import SwiftUI

enum CancelItTheme {
  static let background = Color(red: 0.03, green: 0.03, blue: 0.035)
  static let surface = Color(red: 0.09, green: 0.09, blue: 0.10)
  static let surfaceAlt = Color(red: 0.13, green: 0.13, blue: 0.14)
  static let accent = Color(red: 0.91, green: 0.12, blue: 0.15)
  static let muted = Color.white.opacity(0.62)
  static let border = Color.white.opacity(0.10)
}

struct PrimaryButtonStyle: ButtonStyle {
  func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .font(.headline)
      .frame(maxWidth: .infinity)
      .padding(.vertical, 14)
      .background(CancelItTheme.accent.opacity(configuration.isPressed ? 0.75 : 1))
      .foregroundStyle(.white)
      .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
  }
}

struct SecondaryButtonStyle: ButtonStyle {
  func makeBody(configuration: Configuration) -> some View {
    configuration.label
      .font(.headline)
      .frame(maxWidth: .infinity)
      .padding(.vertical, 14)
      .background(CancelItTheme.surfaceAlt.opacity(configuration.isPressed ? 0.7 : 1))
      .foregroundStyle(.white)
      .overlay(
        RoundedRectangle(cornerRadius: 8, style: .continuous)
          .stroke(CancelItTheme.border)
      )
      .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
  }
}

struct MetricTile: View {
  let title: String
  let value: String
  let icon: String
  let tint: Color

  var body: some View {
    VStack(alignment: .leading, spacing: 12) {
      Image(systemName: icon)
        .font(.title3)
        .foregroundStyle(tint)
      Text(value)
        .font(.system(.title2, design: .rounded, weight: .bold))
      Text(title)
        .font(.footnote)
        .foregroundStyle(CancelItTheme.muted)
    }
    .frame(maxWidth: .infinity, alignment: .leading)
    .padding(16)
    .background(CancelItTheme.surface)
    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
    .overlay(RoundedRectangle(cornerRadius: 8).stroke(CancelItTheme.border))
  }
}

struct EmptyStateView: View {
  let icon: String
  let title: String
  let message: String

  var body: some View {
    VStack(spacing: 14) {
      Image(systemName: icon)
        .font(.largeTitle)
        .foregroundStyle(CancelItTheme.accent)
      Text(title)
        .font(.headline)
      Text(message)
        .font(.subheadline)
        .multilineTextAlignment(.center)
        .foregroundStyle(CancelItTheme.muted)
    }
    .frame(maxWidth: .infinity)
    .padding(24)
    .background(CancelItTheme.surface)
    .clipShape(RoundedRectangle(cornerRadius: 8, style: .continuous))
  }
}

