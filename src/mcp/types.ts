/**
 * MCP Protocol Types
 * Based on Model Context Protocol specification (JSON-RPC 2.0)
 */

export interface MCPRequest {
  jsonrpc: '2.0'
  id?: string | number
  method: string
  params?: Record<string, any>
}

export interface MCPResponse {
  jsonrpc: '2.0'
  id?: string | number
  result?: any
  error?: MCPError
}

export interface MCPError {
  code: number
  message: string
  data?: any
}

export interface MCPTool {
  name: string
  description: string
  inputSchema: {
    type: 'object'
    properties: Record<string, any>
    required?: string[]
  }
}

export interface ToolCallParams {
  name: string
  arguments: Record<string, any>
}

// MCP Error Codes (JSON-RPC 2.0)
export const MCPErrorCode = {
  ParseError: -32700,
  InvalidRequest: -32600,
  MethodNotFound: -32601,
  InvalidParams: -32602,
  InternalError: -32603,
} as const
