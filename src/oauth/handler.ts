/**
 * OAuth Handler for MCP Server
 * Handles authorization UI and user authentication flow
 */

import type { OAuthBindings, OAuthUserProps } from './types'

// Type for the OAuth provider context
interface OAuthContext {
  parseAuthRequest(request: Request): Promise<{
    clientId: string
    redirectUri: string
    state?: string
    scope?: string
    codeChallenge?: string
    codeChallengeMethod?: string
  }>
  lookupClient(clientId: string): Promise<{
    clientId: string
    clientName?: string
    redirectUris: string[]
  } | null>
  completeAuthorization(options: {
    request: {
      clientId: string
      redirectUri: string
      state?: string
      scope?: string
      codeChallenge?: string
      codeChallengeMethod?: string
    }
    userId: string
    scope: string[]
    props: OAuthUserProps
  }): Promise<{ redirectTo: string }>
}

interface OAuthEnv extends OAuthBindings {
  OAUTH_PROVIDER: OAuthContext
}

/**
 * Default handler for OAuth authorization flow
 * This handles non-API requests including the authorization UI
 */
export const oauthHandler = {
  async fetch(request: Request, env: OAuthEnv, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url)

    // Handle authorization endpoint
    if (url.pathname === '/authorize') {
      return handleAuthorize(request, env)
    }

    // Handle login form submission
    if (url.pathname === '/login' && request.method === 'POST') {
      return handleLogin(request, env)
    }

    // Serve the landing page for root
    if (url.pathname === '/') {
      return serveLandingPage(request, env)
    }

    // 404 for unknown paths
    return new Response('Not Found', { status: 404 })
  }
}

/**
 * Handle authorization request - show consent UI
 */
async function handleAuthorize(request: Request, env: OAuthEnv): Promise<Response> {
  try {
    // Parse the OAuth authorization request
    const oauthReq = await env.OAUTH_PROVIDER.parseAuthRequest(request)

    // Look up the client
    const client = await env.OAUTH_PROVIDER.lookupClient(oauthReq.clientId)

    if (!client) {
      return new Response('Unknown client', { status: 400 })
    }

    // Show the authorization/login page
    return new Response(renderAuthPage(oauthReq, client), {
      headers: { 'Content-Type': 'text/html' }
    })
  } catch (error) {
    console.error('Authorization error:', error)
    return new Response('Authorization error', { status: 400 })
  }
}

/**
 * Handle login form submission
 */
async function handleLogin(request: Request, env: OAuthEnv): Promise<Response> {
  try {
    const formData = await request.formData()
    const token = formData.get('token') as string
    const oauthState = formData.get('oauth_state') as string

    // Validate the token against AUTH_TOKEN
    if (!token || token !== env.AUTH_TOKEN) {
      // Parse the state to get client info for error display
      const state = JSON.parse(decodeURIComponent(oauthState))
      const client = await env.OAUTH_PROVIDER.lookupClient(state.clientId)
      return new Response(renderAuthPage(state, client || { clientId: state.clientId, redirectUris: [] }, 'Invalid token. Please try again.'), {
        status: 401,
        headers: { 'Content-Type': 'text/html' }
      })
    }

    // Parse the OAuth state
    const oauthReq = JSON.parse(decodeURIComponent(oauthState))

    // Generate a unique user ID based on the token
    const userId = await hashToken(token)

    // Complete the authorization
    const { redirectTo } = await env.OAUTH_PROVIDER.completeAuthorization({
      request: oauthReq,
      userId: userId.substring(0, 16),
      scope: oauthReq.scope ? oauthReq.scope.split(' ') : ['mcp'],
      props: {
        userId: userId.substring(0, 16),
        username: 'api-user',
        authenticatedAt: Date.now()
      }
    })

    return Response.redirect(redirectTo, 302)
  } catch (error) {
    console.error('Login error:', error)
    return new Response('Login error: ' + (error instanceof Error ? error.message : 'Unknown error'), { status: 500 })
  }
}

/**
 * Hash the token for user ID generation
 */
async function hashToken(token: string): Promise<string> {
  const encoder = new TextEncoder()
  const data = encoder.encode(token)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Render the authorization/login page
 */
function renderAuthPage(
  oauthReq: { clientId: string; redirectUri: string; state?: string; scope?: string; codeChallenge?: string; codeChallengeMethod?: string },
  client: { clientId: string; clientName?: string; redirectUris: string[] },
  error?: string
): string {
  const oauthState = encodeURIComponent(JSON.stringify(oauthReq))
  const clientName = client.clientName || client.clientId

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Authorize - Cloudflare MCP Toolbox</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      color: #e4e4e7;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100vh;
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 2rem;
    }
    .container {
      max-width: 400px;
      width: 100%;
      background: rgba(30, 41, 59, 0.8);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 2rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(148, 163, 184, 0.1);
    }
    h1 {
      font-size: 1.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
      text-align: center;
    }
    .subtitle {
      color: #94a3b8;
      font-size: 0.875rem;
      text-align: center;
      margin-bottom: 1.5rem;
    }
    .client-info {
      background: rgba(15, 23, 42, 0.4);
      border-radius: 8px;
      padding: 1rem;
      margin-bottom: 1.5rem;
      border-left: 3px solid #3b82f6;
    }
    .client-name {
      font-weight: 600;
      color: #f1f5f9;
    }
    .scope-info {
      color: #94a3b8;
      font-size: 0.875rem;
      margin-top: 0.5rem;
    }
    .form-group {
      margin-bottom: 1rem;
    }
    label {
      display: block;
      font-size: 0.875rem;
      color: #94a3b8;
      margin-bottom: 0.5rem;
    }
    input[type="password"] {
      width: 100%;
      padding: 0.75rem;
      background: rgba(15, 23, 42, 0.6);
      border: 1px solid rgba(148, 163, 184, 0.2);
      border-radius: 8px;
      color: #e4e4e7;
      font-size: 1rem;
    }
    input[type="password"]:focus {
      outline: none;
      border-color: #3b82f6;
    }
    .error {
      background: rgba(239, 68, 68, 0.1);
      border: 1px solid rgba(239, 68, 68, 0.3);
      color: #f87171;
      padding: 0.75rem;
      border-radius: 8px;
      margin-bottom: 1rem;
      font-size: 0.875rem;
    }
    button {
      width: 100%;
      padding: 0.75rem;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: white;
      border: none;
      border-radius: 8px;
      font-size: 1rem;
      font-weight: 600;
      cursor: pointer;
      transition: transform 0.2s, box-shadow 0.2s;
    }
    button:hover {
      transform: translateY(-1px);
      box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);
    }
    .cancel {
      display: block;
      text-align: center;
      color: #94a3b8;
      text-decoration: none;
      margin-top: 1rem;
      font-size: 0.875rem;
    }
    .cancel:hover {
      color: #e4e4e7;
    }
  </style>
</head>
<body>
  <div class="container">
    <h1>Authorize Access</h1>
    <p class="subtitle">Cloudflare MCP Toolbox</p>

    <div class="client-info">
      <div class="client-name">${escapeHtml(clientName)}</div>
      <div class="scope-info">is requesting access to your MCP tools</div>
      ${oauthReq.scope ? `<div class="scope-info">Scopes: ${escapeHtml(oauthReq.scope)}</div>` : ''}
    </div>

    ${error ? `<div class="error">${escapeHtml(error)}</div>` : ''}

    <form method="POST" action="/login">
      <input type="hidden" name="oauth_state" value="${oauthState}">

      <div class="form-group">
        <label for="token">Enter your AUTH_TOKEN to authorize:</label>
        <input type="password" id="token" name="token" placeholder="Your AUTH_TOKEN" required autofocus>
      </div>

      <button type="submit">Authorize</button>
    </form>

    <a href="${escapeHtml(oauthReq.redirectUri)}?error=access_denied&state=${oauthReq.state || ''}" class="cancel">Cancel</a>
  </div>
</body>
</html>`
}

/**
 * Escape HTML to prevent XSS
 */
function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/**
 * Serve the landing page
 */
async function serveLandingPage(request: Request, env: OAuthEnv): Promise<Response> {
  const url = new URL(request.url)
  const baseUrl = `${url.protocol}//${url.host}`

  return new Response(renderLandingPage(baseUrl), {
    headers: { 'Content-Type': 'text/html' }
  })
}

/**
 * Render the landing page with dynamic URLs
 */
function renderLandingPage(baseUrl: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Cloudflare MCP Toolbox</title>
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body {
      font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
      line-height: 1.6;
      color: #e4e4e7;
      background: linear-gradient(135deg, #0f172a 0%, #1e293b 100%);
      min-height: 100vh;
      padding: 2rem;
    }
    .container {
      max-width: 900px;
      margin: 0 auto;
      background: rgba(30, 41, 59, 0.6);
      backdrop-filter: blur(10px);
      border-radius: 16px;
      padding: 3rem;
      box-shadow: 0 20px 60px rgba(0, 0, 0, 0.3);
      border: 1px solid rgba(148, 163, 184, 0.1);
    }
    h1 {
      font-size: 2.5rem;
      font-weight: 700;
      margin-bottom: 0.5rem;
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      background-clip: text;
    }
    .subtitle {
      color: #94a3b8;
      font-size: 1.125rem;
      margin-bottom: 2rem;
    }
    .section { margin: 2rem 0; }
    h2 {
      font-size: 1.5rem;
      color: #f1f5f9;
      margin-bottom: 1rem;
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .badge {
      display: inline-block;
      padding: 0.25rem 0.75rem;
      background: rgba(34, 197, 94, 0.2);
      color: #4ade80;
      border-radius: 9999px;
      font-size: 0.875rem;
      font-weight: 600;
      margin-left: 0.5rem;
    }
    code {
      background: rgba(15, 23, 42, 0.6);
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-family: 'Monaco', 'Courier New', monospace;
      font-size: 0.875rem;
      color: #7dd3fc;
    }
    pre {
      background: rgba(15, 23, 42, 0.8);
      padding: 1rem;
      border-radius: 8px;
      overflow-x: auto;
      border: 1px solid rgba(148, 163, 184, 0.1);
      margin: 1rem 0;
    }
    pre code {
      background: none;
      padding: 0;
      color: #e4e4e7;
    }
    .endpoint {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1rem;
      background: rgba(15, 23, 42, 0.4);
      border-radius: 8px;
      margin: 0.5rem 0;
      border-left: 3px solid #3b82f6;
    }
    .method {
      background: #3b82f6;
      color: white;
      padding: 0.25rem 0.5rem;
      border-radius: 4px;
      font-weight: 600;
      font-size: 0.75rem;
    }
    .method.get { background: #22c55e; }
    .status {
      display: inline-flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      background: rgba(34, 197, 94, 0.1);
      border: 1px solid rgba(34, 197, 94, 0.3);
      border-radius: 8px;
      color: #4ade80;
      font-weight: 600;
      margin-top: 1rem;
    }
    .status:before {
      content: "✓";
      background: #22c55e;
      color: white;
      width: 1.25rem;
      height: 1.25rem;
      border-radius: 50%;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 0.875rem;
    }
    .grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 1rem;
      margin: 1rem 0;
    }
    .card {
      background: rgba(15, 23, 42, 0.4);
      padding: 1rem;
      border-radius: 8px;
      border-left: 3px solid #8b5cf6;
    }
    .card h3 {
      color: #c4b5fd;
      font-size: 1rem;
      margin-bottom: 0.5rem;
    }
    .card p {
      color: #94a3b8;
      font-size: 0.875rem;
    }
    ul { list-style: none; margin-left: 0; }
    li {
      padding: 0.5rem 0;
      padding-left: 1.5rem;
      position: relative;
    }
    li:before {
      content: "→";
      position: absolute;
      left: 0;
      color: #3b82f6;
    }
    a { color: #60a5fa; }
  </style>
</head>
<body>
  <div class="container">
    <h1>Cloudflare MCP Toolbox</h1>
    <p class="subtitle">Utility tools for AI agents - with OAuth 2.1 support for Claude.AI</p>

    <div class="status">Server Online - OAuth Enabled</div>

    <div class="section">
      <h2>MCP Endpoint</h2>
      <div class="endpoint">
        <span class="method">POST</span>
        <code>/mcp</code>
        <span style="color: #94a3b8;">HTTP Streamable (JSON-RPC 2.0)</span>
      </div>
    </div>

    <div class="section">
      <h2>OAuth 2.1 Endpoints<span class="badge">Claude.AI Compatible</span></h2>
      <div class="endpoint">
        <span class="method get">GET</span>
        <code>/.well-known/oauth-authorization-server</code>
        <span style="color: #94a3b8;">Server Metadata</span>
      </div>
      <div class="endpoint">
        <span class="method">POST</span>
        <code>/oauth/register</code>
        <span style="color: #94a3b8;">Dynamic Client Registration</span>
      </div>
      <div class="endpoint">
        <span class="method get">GET</span>
        <code>/authorize</code>
        <span style="color: #94a3b8;">Authorization UI</span>
      </div>
      <div class="endpoint">
        <span class="method">POST</span>
        <code>/oauth/token</code>
        <span style="color: #94a3b8;">Token Exchange</span>
      </div>
    </div>

    <div class="section">
      <h2>Connect with Claude.AI</h2>
      <p style="color: #94a3b8; margin-bottom: 1rem;">Add as a custom connector in Claude.AI settings:</p>
      <pre><code>MCP Server URL: ${baseUrl}/mcp</code></pre>
      <p style="color: #94a3b8; margin-top: 1rem;">
        Claude.AI will automatically discover OAuth endpoints and initiate the authorization flow.
        You'll be prompted to enter your AUTH_TOKEN to grant access.
      </p>
    </div>

    <div class="section">
      <h2>Tool Categories<span class="badge">30 tools</span></h2>
      <div class="grid">
        <div class="card">
          <h3>Date/Time (5)</h3>
          <p>get_current_datetime, convert_timezone, calculate_duration, format_date, parse_date</p>
        </div>
        <div class="card">
          <h3>Math (6)</h3>
          <p>calculate, convert_units, statistics, random_number, percentage, roll_dice</p>
        </div>
        <div class="card">
          <h3>Text (6)</h3>
          <p>transform_text, encode_decode, extract_patterns, hash_text, count_words, truncate_text</p>
        </div>
        <div class="card">
          <h3>Validation (6)</h3>
          <p>validate_email, validate_url, validate_phone, validate_json, sanitize_html, validate_schema</p>
        </div>
        <div class="card">
          <h3>KV Storage (4)</h3>
          <p>kv_get, kv_set, kv_delete, kv_list</p>
        </div>
        <div class="card">
          <h3>Workers AI (3)</h3>
          <p>ai_chat, ai_classify, ai_embed</p>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>Documentation</h2>
      <ul>
        <li><a href="https://github.com/jezweb/cloudflare-mcp-toolbox" target="_blank">GitHub Repository</a> - Source code and setup guide</li>
        <li><a href="https://modelcontextprotocol.io" target="_blank">MCP Protocol Specification</a></li>
      </ul>
    </div>
  </div>
</body>
</html>`
}

export default oauthHandler
