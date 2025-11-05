/**
 * Cloudflare MCP Toolbox
 * Utility tools for AI agents - date/time, math, text, validation, KV, AI
 */

import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { bearerAuth } from 'hono/bearer-auth'
import type { MCPRequest } from './mcp/types'
import { handleMCPRequest } from './mcp/server'

// Type-safe environment bindings
type Bindings = {
  CACHE: KVNamespace
  AI: Ai
  AUTH_TOKEN: string
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for MCP clients
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}))

/**
 * Authentication middleware for MCP endpoints
 * Validates Bearer token from Authorization header
 */
app.use('/mcp/*', async (c, next) => {
  const auth = bearerAuth({
    token: c.env.AUTH_TOKEN,
    realm: 'Cloudflare MCP Toolbox',
    hashFunction: (token: string) => token, // Direct comparison
  })
  return auth(c, next)
})

/**
 * MCP Endpoint (HTTP Streamable)
 * POST /mcp
 */
app.post('/mcp', async (c) => {
  try {
    const body = await c.req.json<MCPRequest>()

    // Validate JSON-RPC format
    if (!body || body.jsonrpc !== '2.0') {
      return c.json({
        jsonrpc: '2.0',
        id: body?.id,
        error: {
          code: -32600,
          message: 'Invalid Request: missing or invalid jsonrpc field',
        },
      }, 400)
    }

    // Handle MCP request
    const response = await handleMCPRequest(body, {
      CACHE: c.env.CACHE,
      AI: c.env.AI,
    })

    return c.json(response)
  } catch (error) {
    console.error('Error handling MCP request:', error)
    return c.json({
      jsonrpc: '2.0',
      error: {
        code: -32700,
        message: 'Parse error',
      },
    }, 400)
  }
})

/**
 * Root endpoint - Discovery page with setup instructions
 */
app.get('/', (c) => {
  return c.html(`
<!DOCTYPE html>
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
    .section {
      margin: 2rem 0;
    }
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
      background: rgba(59, 130, 246, 0.2);
      color: #60a5fa;
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
    ul {
      list-style: none;
      margin-left: 0;
    }
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
  </style>
</head>
<body>
  <div class="container">
    <h1>Cloudflare MCP Toolbox</h1>
    <p class="subtitle">Utility tools for AI agents - date/time, math, text processing, validation, KV storage, and Workers AI</p>

    <div class="status">Server Online</div>

    <div class="section">
      <h2>📡 MCP Endpoint</h2>
      <div class="endpoint">
        <span class="method">POST</span>
        <code>/mcp</code>
        <span style="color: #94a3b8;">HTTP Streamable (JSON-RPC 2.0)</span>
      </div>
    </div>

    <div class="section">
      <h2>🔧 BetterChat Configuration</h2>
      <p style="color: #94a3b8; margin-bottom: 1rem;">Add this MCP server to BetterChat:</p>
      <pre><code>{
  "url": "https://your-worker.workers.dev/mcp",
  "headers": {
    "Authorization": "Bearer your-auth-token-here"
  }
}</code></pre>
      <p style="color: #f59e0b; margin-top: 1rem; padding: 0.75rem; background: rgba(245, 158, 11, 0.1); border-left: 3px solid #f59e0b; border-radius: 4px;">
        <strong>⚠️ Authentication Required</strong><br>
        Contact the server administrator for the <code>AUTH_TOKEN</code> to access this MCP server.
      </p>
    </div>

    <div class="section">
      <h2>🛠️ Tool Categories<span class="badge">25 tools</span></h2>
      <div class="grid">
        <div class="card">
          <h3>📅 Date/Time</h3>
          <p>5 tools for timezone conversion, duration calculations, date formatting</p>
        </div>
        <div class="card">
          <h3>🔢 Math</h3>
          <p>5 tools for calculations, unit conversions, statistics</p>
        </div>
        <div class="card">
          <h3>✏️ Text</h3>
          <p>6 tools for text transformation, encoding, pattern extraction</p>
        </div>
        <div class="card">
          <h3>✅ Validation</h3>
          <p>6 tools for email, URL, JSON validation and sanitization</p>
        </div>
        <div class="card">
          <h3>💾 KV Storage</h3>
          <p>4 tools for key-value storage operations</p>
        </div>
        <div class="card">
          <h3>🤖 Workers AI</h3>
          <p>3 tools for LLM inference, classification, embeddings</p>
        </div>
      </div>
    </div>

    <div class="section">
      <h2>📚 Key Features</h2>
      <ul>
        <li><strong>Australia/Sydney timezone</strong> - Default timezone for all date/time operations</li>
        <li><strong>Cryptographically secure</strong> - Random numbers, hashing with Web Crypto API</li>
        <li><strong>Safe expression evaluation</strong> - Math calculations without code injection</li>
        <li><strong>Workers AI integration</strong> - Llama 3.1 for chat, DistilBERT for sentiment, BGE for embeddings</li>
        <li><strong>KV storage</strong> - Persistent key-value storage with TTL support</li>
        <li><strong>Embedded caching</strong> - AI embeddings automatically cached to reduce quota usage</li>
      </ul>
    </div>

    <div class="section">
      <h2>📖 Documentation</h2>
      <ul>
        <li>View all tool definitions: <code>POST /mcp</code> with <code>method: "tools/list"</code></li>
        <li>See <code>docs/API_ENDPOINTS.md</code> for complete tool documentation</li>
        <li><a href="https://modelcontextprotocol.io" target="_blank" style="color: #60a5fa;">MCP Protocol Specification</a></li>
      </ul>
    </div>
  </div>
</body>
</html>
  `)
})

/**
 * Export the Hono app directly (ES Module format)
 * This is the correct pattern for Cloudflare Workers with Hono
 */
export default app
