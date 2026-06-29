import Foundation

struct APIClient {
  let baseURL: URL
  private let decoder = JSONDecoder()
  private let encoder = JSONEncoder()

  init(baseURL: URL) {
    self.baseURL = baseURL
    decoder.keyDecodingStrategy = .convertFromSnakeCase
  }

  func get<T: Decodable>(_ path: String, token: String?) async throws -> T {
    var request = URLRequest(url: baseURL.appending(path: path))
    request.httpMethod = "GET"
    authorize(&request, token: token)
    return try await send(request)
  }

  func post<T: Decodable, Body: Encodable>(_ path: String, body: Body, token: String?) async throws -> T {
    var request = URLRequest(url: baseURL.appending(path: path))
    request.httpMethod = "POST"
    request.setValue("application/json", forHTTPHeaderField: "Content-Type")
    authorize(&request, token: token)
    request.httpBody = try encoder.encode(body)
    return try await send(request)
  }

  private func authorize(_ request: inout URLRequest, token: String?) {
    if let token {
      request.setValue("Bearer \(token)", forHTTPHeaderField: "Authorization")
    }
  }

  private func send<T: Decodable>(_ request: URLRequest) async throws -> T {
    let (data, response) = try await URLSession.shared.data(for: request)
    guard let http = response as? HTTPURLResponse else { throw CancelItError.network("Invalid server response.") }

    guard (200..<300).contains(http.statusCode) else {
      if let envelope = try? decoder.decode(ErrorEnvelope.self, from: data) {
        throw CancelItError.network(envelope.error)
      }
      throw CancelItError.network("Request failed with status \(http.statusCode).")
    }

    return try decoder.decode(T.self, from: data)
  }
}

enum CancelItError: LocalizedError {
  case configuration(String)
  case network(String)

  var errorDescription: String? {
    switch self {
    case .configuration(let message), .network(let message):
      message
    }
  }
}

struct ErrorEnvelope: Decodable {
  let error: String
}
