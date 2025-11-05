/**
 * MCP Server Implementation
 * Handles MCP protocol messages over HTTP (JSON-RPC 2.0)
 */

import type { MCPRequest, MCPResponse } from './types'
import { MCP_TOOLS } from './tools'
import {
  createMCPResponse,
  createMethodNotFoundError,
  createInvalidParamsError,
  createInternalError,
} from '../utils/responses'
import {
  getCurrentDateTime,
  convertTimezone,
  calculateDuration,
  formatDate,
  parseDate,
} from '../handlers/datetime'
import {
  calculate,
  convertUnits,
  statistics,
  randomNumber,
  percentage,
  rollDice,
} from '../handlers/math'
import {
  transformText,
  encodeDecode,
  extractPatterns,
  hashText,
  countWords,
  truncateText,
} from '../handlers/text'
import {
  validateEmail,
  validateUrl,
  validatePhone,
  validateJson,
  sanitizeHtml,
  validateSchema,
} from '../handlers/validation'
import {
  kvGet,
  kvSet,
  kvDelete,
  kvList,
} from '../handlers/kv'
import {
  aiChat,
  aiClassify,
  aiEmbed,
} from '../handlers/ai'

export interface MCPServerEnv {
  CACHE: KVNamespace
  AI: Ai
}

export async function handleMCPRequest(
  request: MCPRequest,
  env: MCPServerEnv
): Promise<MCPResponse> {
  const { id, method, params } = request

  try {
    switch (method) {
      case 'initialize':
        return handleInitialize(id)

      case 'tools/list':
        return handleToolsList(id)

      case 'tools/call':
        return await handleToolsCall(id, params, env)

      default:
        return createMethodNotFoundError(id, method)
    }
  } catch (error) {
    console.error('MCP Request Error:', error)
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createInternalError(id, message)
  }
}

function handleInitialize(id: string | number | undefined): MCPResponse {
  return createMCPResponse(id, {
    protocolVersion: '2024-11-05',
    serverInfo: {
      name: 'cloudflare-mcp-toolbox',
      version: '1.0.0',
    },
    capabilities: {
      tools: {},
    },
  })
}

function handleToolsList(id: string | number | undefined): MCPResponse {
  return createMCPResponse(id, {
    tools: MCP_TOOLS,
  })
}

async function handleToolsCall(
  id: string | number | undefined,
  params: any,
  env: MCPServerEnv
): Promise<MCPResponse> {
  if (!params || !params.name) {
    return createInvalidParamsError(id, 'Missing required parameter: name')
  }

  const { name, arguments: args } = params

  try {
    switch (name) {
      // Phase 2: Date/Time tools
      case 'get_current_datetime': {
        const result = getCurrentDateTime(args)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      case 'convert_timezone': {
        const result = convertTimezone(args)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      case 'calculate_duration': {
        const result = calculateDuration(args)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      case 'format_date': {
        const result = formatDate(args)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      case 'parse_date': {
        const result = parseDate(args)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      // Phase 3: Math/Calculation tools
      case 'calculate': {
        const result = calculate(args)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      case 'convert_units': {
        const result = convertUnits(args)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      case 'statistics': {
        const result = statistics(args)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      case 'random_number': {
        const result = randomNumber(args)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      case 'percentage': {
        const result = percentage(args)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      case 'roll_dice': {
        const result = rollDice(args)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      // Phase 4: Text processing tools
      case 'transform_text': {
        const result = transformText(args)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      case 'encode_decode': {
        const result = encodeDecode(args)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      case 'extract_patterns': {
        const result = extractPatterns(args)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      case 'hash_text': {
        const result = await hashText(args)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      case 'count_words': {
        const result = countWords(args)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      case 'truncate_text': {
        const result = truncateText(args)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      // Phase 5: Data validation tools
      case 'validate_email': {
        const result = validateEmail(args)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      case 'validate_url': {
        const result = validateUrl(args)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      case 'validate_phone': {
        const result = validatePhone(args)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      case 'validate_json': {
        const result = validateJson(args)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      case 'sanitize_html': {
        const result = sanitizeHtml(args)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      case 'validate_schema': {
        const result = validateSchema(args)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      // Phase 6: KV storage tools
      case 'kv_get': {
        const result = await kvGet(args, env.CACHE)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      case 'kv_set': {
        const result = await kvSet(args, env.CACHE)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      case 'kv_delete': {
        const result = await kvDelete(args, env.CACHE)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      case 'kv_list': {
        const result = await kvList(args, env.CACHE)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      // Phase 7: Workers AI tools
      case 'ai_chat': {
        const result = await aiChat(args, env.AI)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      case 'ai_classify': {
        const result = await aiClassify(args, env.AI)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      case 'ai_embed': {
        const result = await aiEmbed(args, env.AI, env.CACHE)
        return createMCPResponse(id, {
          content: [{ type: 'text', text: result }],
        })
      }

      default:
        return createInvalidParamsError(id, `Unknown tool: ${name}`)
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error'
    return createInternalError(id, `${name} failed: ${message}`)
  }
}
