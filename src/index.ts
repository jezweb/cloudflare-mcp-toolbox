/**
 * Cloudflare MCP Toolbox
 * Utility tools for AI agents - date/time, math, text, validation, KV, AI
 * With OAuth 2.1 support for Claude.AI integration
 */

import { OAuthProvider } from '@cloudflare/workers-oauth-provider'
import { MCPApiHandler } from './mcp/api'
import { oauthHandler } from './oauth/handler'

// Type-safe environment bindings
type Bindings = {
  CACHE: KVNamespace
  OAUTH_KV: KVNamespace
  AI: Ai
  AUTH_TOKEN: string
  COOKIE_ENCRYPTION_KEY: string
}

/**
 * Export the OAuthProvider as the main handler
 * This wraps the entire Worker and provides:
 * - OAuth 2.1 endpoints (/.well-known/oauth-authorization-server, /oauth/register, /oauth/token)
 * - Authorization UI (/authorize)
 * - Protected API routes (/mcp)
 */
export default new OAuthProvider({
  // API routes that require OAuth authentication
  apiRoute: '/mcp',

  // Handler for authenticated API requests
  apiHandler: MCPApiHandler,

  // Handler for non-API requests (auth UI, landing page)
  defaultHandler: oauthHandler,

  // OAuth endpoint configuration
  authorizeEndpoint: '/authorize',
  tokenEndpoint: '/oauth/token',
  clientRegistrationEndpoint: '/oauth/register',

  // Scopes supported by this MCP server
  scopesSupported: ['mcp', 'tools:read', 'tools:execute'],

  // Security settings
  allowImplicitFlow: false,

  // Allow public clients (like Claude.AI) to register dynamically
  disallowPublicClientRegistration: false,

  // Refresh token lifetime: 30 days
  refreshTokenTTL: 2592000,
})

// Also export the API handler for Durable Objects / Service Bindings if needed
export { MCPApiHandler }
