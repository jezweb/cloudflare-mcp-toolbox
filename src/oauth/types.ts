/**
 * OAuth Types for MCP Server
 * Based on OAuth 2.1 and RFC 7591 (Dynamic Client Registration)
 */

export interface OAuthUserProps {
  userId: string
  username: string
  authenticatedAt: number
}

export interface OAuthClientInfo {
  clientId: string
  clientName?: string
  redirectUris: string[]
  scope?: string
}

export interface AuthorizationRequest {
  clientId: string
  redirectUri: string
  state?: string
  scope?: string
  codeChallenge?: string
  codeChallengeMethod?: string
}

export interface TokenRequest {
  grantType: string
  code?: string
  refreshToken?: string
  codeVerifier?: string
  clientId?: string
  clientSecret?: string
}

// Environment bindings for OAuth
export interface OAuthBindings {
  OAUTH_KV: KVNamespace
  CACHE: KVNamespace
  AI: Ai
  AUTH_TOKEN: string
  COOKIE_ENCRYPTION_KEY: string
}
