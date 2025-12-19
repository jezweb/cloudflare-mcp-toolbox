/**
 * MCP API Handler for OAuth-protected requests
 * This class handles authenticated MCP requests from OAuthProvider
 */

import { WorkerEntrypoint } from 'cloudflare:workers'
import type { MCPRequest, MCPResponse } from './types'
import { handleMCPRequest, MCPServerEnv } from './server'

interface ApiEnv {
  CACHE: KVNamespace
  AI: Ai
  AUTH_TOKEN: string
}

interface OAuthProps {
  userId: string
  username: string
  authenticatedAt: number
}

/**
 * MCP API Handler - receives OAuth-authenticated requests
 */
export class MCPApiHandler extends WorkerEntrypoint<ApiEnv> {
  // User props from OAuth authentication
  private get userProps(): OAuthProps | undefined {
    return (this.ctx as any).props as OAuthProps | undefined
  }

  async fetch(request: Request): Promise<Response> {
    const url = new URL(request.url)

    // Handle MCP endpoint
    if (url.pathname === '/mcp' && request.method === 'POST') {
      return this.handleMCP(request)
    }

    // Handle health check
    if (url.pathname === '/mcp/health') {
      return new Response(JSON.stringify({
        status: 'ok',
        authenticated: !!this.userProps,
        userId: this.userProps?.userId
      }), {
        headers: { 'Content-Type': 'application/json' }
      })
    }

    return new Response('Not Found', { status: 404 })
  }

  private async handleMCP(request: Request): Promise<Response> {
    try {
      const body = await request.json<MCPRequest>()

      // Validate JSON-RPC format
      if (!body || body.jsonrpc !== '2.0') {
        return new Response(JSON.stringify({
          jsonrpc: '2.0',
          id: body?.id,
          error: {
            code: -32600,
            message: 'Invalid Request: missing or invalid jsonrpc field',
          },
        }), {
          status: 400,
          headers: { 'Content-Type': 'application/json' }
        })
      }

      // Handle MCP request
      const mcpEnv: MCPServerEnv = {
        CACHE: this.env.CACHE,
        AI: this.env.AI,
      }

      const response = await handleMCPRequest(body, mcpEnv)

      return new Response(JSON.stringify(response), {
        headers: { 'Content-Type': 'application/json' }
      })
    } catch (error) {
      console.error('Error handling MCP request:', error)
      return new Response(JSON.stringify({
        jsonrpc: '2.0',
        error: {
          code: -32700,
          message: 'Parse error',
        },
      }), {
        status: 400,
        headers: { 'Content-Type': 'application/json' }
      })
    }
  }
}

export default MCPApiHandler
