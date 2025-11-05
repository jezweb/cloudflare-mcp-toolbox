/**
 * MCP Response Helpers
 * Utilities for creating standardized MCP protocol responses
 */

import type { MCPResponse, MCPError } from '../mcp/types'
import { MCPErrorCode } from '../mcp/types'

export function createMCPResponse(
  id: string | number | undefined,
  result: any
): MCPResponse {
  return {
    jsonrpc: '2.0',
    id,
    result,
  }
}

export function createMCPError(
  id: string | number | undefined,
  code: number,
  message: string,
  data?: any
): MCPResponse {
  const error: MCPError = {
    code,
    message,
  }

  if (data) {
    error.data = data
  }

  return {
    jsonrpc: '2.0',
    id,
    error,
  }
}

export function createMethodNotFoundError(
  id: string | number | undefined,
  method: string
): MCPResponse {
  return createMCPError(
    id,
    MCPErrorCode.MethodNotFound,
    `Method not found: ${method}`
  )
}

export function createInvalidParamsError(
  id: string | number | undefined,
  message: string
): MCPResponse {
  return createMCPError(id, MCPErrorCode.InvalidParams, message)
}

export function createInternalError(
  id: string | number | undefined,
  message: string
): MCPResponse {
  return createMCPError(id, MCPErrorCode.InternalError, message)
}
