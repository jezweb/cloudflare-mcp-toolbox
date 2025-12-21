/**
 * Cloudflare MCP Toolbox
 * OAuth-enabled MCP server with 30 utility tools for AI agents
 *
 * Uses Google OAuth for authentication with Claude.ai and other MCP clients
 */

import OAuthProvider from '@cloudflare/workers-oauth-provider';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { McpAgent } from 'agents/mcp';
import { z } from 'zod';
import { GoogleHandler } from './oauth/google-handler';

// Import tool handlers
import {
  getCurrentDateTime,
  convertTimezone,
  calculateDuration,
  formatDate,
  parseDate,
} from './handlers/datetime';
import {
  calculate,
  convertUnits,
  statistics,
  randomNumber,
  percentage,
  rollDice,
} from './handlers/math';
import {
  transformText,
  encodeDecode,
  extractPatterns,
  hashText,
  countWords,
  truncateText,
} from './handlers/text';
import {
  validateEmail,
  validateUrl,
  validatePhone,
  validateJson,
  sanitizeHtml,
  validateSchema,
} from './handlers/validation';
import { kvGet, kvSet, kvDelete, kvList } from './handlers/kv';
import { aiChat, aiClassify, aiEmbed } from './handlers/ai';

// Props from OAuth - user info stored in token
type Props = {
  id: string;
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
};

/**
 * Cloudflare MCP Toolbox Agent
 * Durable Object that handles MCP tool calls with OAuth context
 */
export class ToolboxMCP extends McpAgent<Env, Record<string, never>, Props> {
  server = new McpServer({
    name: 'cloudflare-mcp-toolbox',
    version: '1.0.0',
  });

  async init() {
    // ============================================
    // Date/Time Tools (5)
    // ============================================

    this.server.tool(
      'get_current_datetime',
      'Get current date and time in specified timezone (defaults to Australia/Sydney)',
      {
        timezone: z.string().optional().describe('IANA timezone (e.g., "America/New_York", "Europe/London"). Default: "Australia/Sydney"'),
        format: z.enum(['iso', 'unix', 'readable']).optional().describe('Output format: "iso" (ISO 8601), "unix" (timestamp), "readable" (human-friendly). Default: "iso"'),
      },
      async (args) => {
        const result = getCurrentDateTime(args);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    this.server.tool(
      'convert_timezone',
      'Convert datetime from one timezone to another',
      {
        datetime: z.string().describe('Input datetime (ISO 8601 string or unix timestamp)'),
        from_timezone: z.string().describe('Source timezone (IANA format)'),
        to_timezone: z.string().describe('Target timezone (IANA format)'),
        format: z.enum(['iso', 'unix', 'readable']).optional().describe('Output format. Default: "iso"'),
      },
      async (args) => {
        const result = convertTimezone(args);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    this.server.tool(
      'calculate_duration',
      'Calculate time difference between two dates',
      {
        start: z.string().describe('Start datetime (ISO 8601 or unix timestamp)'),
        end: z.string().describe('End datetime (ISO 8601 or unix timestamp)'),
        unit: z.enum(['seconds', 'minutes', 'hours', 'days']).optional().describe('Unit for result. Default: "seconds"'),
      },
      async (args) => {
        const result = calculateDuration(args);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    this.server.tool(
      'format_date',
      'Format date in various styles',
      {
        datetime: z.string().describe('Input datetime (ISO 8601 or unix timestamp)'),
        format: z.enum(['iso', 'relative', 'short', 'long', 'time_only', 'date_only']).describe('Format style'),
        timezone: z.string().optional().describe('Timezone for output. Default: "Australia/Sydney"'),
      },
      async (args) => {
        const result = formatDate(args);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    this.server.tool(
      'parse_date',
      'Parse natural language date expressions like "tomorrow", "in 3 days", "next Friday"',
      {
        expression: z.string().describe('Natural language expression (e.g., "tomorrow", "in 3 hours", "next Monday", "2 days ago")'),
        timezone: z.string().optional().describe('Reference timezone. Default: "Australia/Sydney"'),
        format: z.enum(['iso', 'unix', 'readable']).optional().describe('Output format. Default: "iso"'),
      },
      async (args) => {
        const result = parseDate(args);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    // ============================================
    // Math Tools (6)
    // ============================================

    this.server.tool(
      'calculate',
      'Safely evaluate mathematical expressions. Supports +, -, *, /, ^, sqrt, pow, abs, sin, cos, tan, log, exp',
      {
        expression: z.string().describe('Mathematical expression (e.g., "2 + 2 * 3", "sqrt(16)", "2^3")'),
      },
      async (args) => {
        const result = calculate(args);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    this.server.tool(
      'convert_units',
      'Convert between units of measurement (length, weight, volume, time, temperature)',
      {
        value: z.number().describe('Numeric value to convert'),
        from_unit: z.string().describe('Source unit (e.g., "km", "lbs", "celsius", "liters")'),
        to_unit: z.string().describe('Target unit (e.g., "miles", "kg", "fahrenheit", "gallons")'),
      },
      async (args) => {
        const result = convertUnits(args);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    this.server.tool(
      'statistics',
      'Calculate statistical measures on an array of numbers',
      {
        numbers: z.array(z.number()).describe('Array of numbers to analyze'),
        metrics: z.array(z.enum(['mean', 'median', 'mode', 'stddev', 'variance', 'min', 'max', 'sum', 'count'])).optional().describe('Metrics to calculate (default: all)'),
      },
      async (args) => {
        const result = statistics(args);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    this.server.tool(
      'random_number',
      'Generate cryptographically secure random number in specified range',
      {
        min: z.number().optional().describe('Minimum value (default: 0)'),
        max: z.number().optional().describe('Maximum value (default: 1)'),
        integer: z.boolean().optional().describe('Return integer instead of float (default: false)'),
      },
      async (args) => {
        const result = randomNumber(args);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    this.server.tool(
      'percentage',
      'Calculate percentages and percentage changes',
      {
        operation: z.enum(['of', 'change', 'is_what_percent']).describe('"of" (X% of Y), "change" (% change from X to Y), "is_what_percent" (X is what % of Y)'),
        value1: z.number().describe('First value'),
        value2: z.number().describe('Second value'),
      },
      async (args) => {
        const result = percentage(args);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    this.server.tool(
      'roll_dice',
      'Roll dice using standard notation (e.g., "2d6", "1d20+5", "3d8-2")',
      {
        notation: z.string().describe('Dice notation (e.g., "2d6" for two six-sided dice, "1d20+5" for one d20 with +5 modifier)'),
      },
      async (args) => {
        const result = rollDice(args);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    // ============================================
    // Text Tools (6)
    // ============================================

    this.server.tool(
      'transform_text',
      'Transform text in various ways (uppercase, lowercase, titlecase, slug, trim, reverse)',
      {
        text: z.string().describe('Text to transform'),
        operation: z.enum(['uppercase', 'lowercase', 'titlecase', 'slug', 'trim', 'reverse']).describe('Transformation to apply'),
      },
      async (args) => {
        const result = transformText(args);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    this.server.tool(
      'encode_decode',
      'Encode or decode text using various formats (base64, URL, HTML)',
      {
        text: z.string().describe('Text to encode or decode'),
        operation: z.enum(['base64_encode', 'base64_decode', 'url_encode', 'url_decode', 'html_escape', 'html_unescape']).describe('Encoding/decoding operation to perform'),
      },
      async (args) => {
        const result = encodeDecode(args);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    this.server.tool(
      'extract_patterns',
      'Extract patterns from text using predefined or custom regex (emails, URLs, phone numbers, hashtags, mentions)',
      {
        text: z.string().describe('Text to search'),
        pattern: z.enum(['emails', 'urls', 'phone_numbers', 'hashtags', 'mentions', 'custom']).describe('Pattern type to extract'),
        custom_regex: z.string().optional().describe('Custom regex pattern (required when pattern is "custom")'),
      },
      async (args) => {
        const result = extractPatterns(args);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    this.server.tool(
      'hash_text',
      'Hash text using SHA-256, SHA-1, or MD5 (uses SHA-256 for MD5 fallback)',
      {
        text: z.string().describe('Text to hash'),
        algorithm: z.enum(['sha256', 'sha1', 'md5']).describe('Hash algorithm to use'),
        output_format: z.enum(['hex', 'base64']).optional().describe('Output format (default: "hex")'),
      },
      async (args) => {
        const result = await hashText(args);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    this.server.tool(
      'count_words',
      'Count words, characters, sentences, and paragraphs in text',
      {
        text: z.string().describe('Text to analyze'),
        metrics: z.array(z.enum(['words', 'characters', 'sentences', 'paragraphs'])).optional().describe('Metrics to calculate (default: all)'),
      },
      async (args) => {
        const result = countWords(args);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    this.server.tool(
      'truncate_text',
      'Truncate text to specified length with optional ellipsis and word boundary preservation',
      {
        text: z.string().describe('Text to truncate'),
        max_length: z.number().describe('Maximum length of output'),
        ellipsis: z.boolean().optional().describe('Add ellipsis (...) at end (default: true)'),
        break_words: z.boolean().optional().describe('Allow breaking in middle of words (default: false)'),
      },
      async (args) => {
        const result = truncateText(args);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    // ============================================
    // Validation Tools (6)
    // ============================================

    this.server.tool(
      'validate_email',
      'Validate email address format',
      {
        email: z.string().describe('Email address to validate'),
      },
      async (args) => {
        const result = validateEmail(args);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    this.server.tool(
      'validate_url',
      'Validate URL format and parse components (protocol, domain, path, query)',
      {
        url: z.string().describe('URL to validate'),
        require_protocol: z.boolean().optional().describe('Require http/https protocol (default: true)'),
      },
      async (args) => {
        const result = validateUrl(args);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    this.server.tool(
      'validate_phone',
      'Validate phone number format and format for display',
      {
        phone: z.string().describe('Phone number to validate'),
        country_code: z.string().optional().describe('Optional country code (e.g., "US", "AU")'),
      },
      async (args) => {
        const result = validatePhone(args);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    this.server.tool(
      'validate_json',
      'Validate JSON string and parse it',
      {
        json_string: z.string().describe('JSON string to validate'),
      },
      async (args) => {
        const result = validateJson(args);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    this.server.tool(
      'sanitize_html',
      'Sanitize HTML by stripping tags or escaping entities',
      {
        html: z.string().describe('HTML content to sanitize'),
        mode: z.enum(['strip', 'escape']).describe('"strip" removes all tags, "escape" converts to HTML entities'),
      },
      async (args) => {
        const result = sanitizeHtml(args);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    this.server.tool(
      'validate_schema',
      'Validate data against a simple JSON schema',
      {
        data: z.any().describe('Data to validate'),
        schema: z.object({
          type: z.string().describe('Expected data type'),
          required: z.array(z.string()).optional().describe('Required fields (for objects)'),
          properties: z.record(z.string(), z.any()).optional().describe('Property definitions (for objects)'),
        }).describe('Schema definition with type, required, and properties'),
      },
      async (args) => {
        const result = validateSchema(args);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    // ============================================
    // KV Storage Tools (4)
    // ============================================

    this.server.tool(
      'kv_get',
      'Get value from Cloudflare KV storage',
      {
        key: z.string().describe('KV key to retrieve'),
        type: z.enum(['text', 'json']).optional().describe('Value type (default: "text")'),
      },
      async (args) => {
        const result = await kvGet(args, this.env.CACHE);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    this.server.tool(
      'kv_set',
      'Set value in Cloudflare KV storage with optional TTL',
      {
        key: z.string().describe('KV key to set'),
        value: z.any().describe('Value to store (string or JSON-serializable object)'),
        ttl: z.number().optional().describe('Time-to-live in seconds (optional)'),
      },
      async (args) => {
        const result = await kvSet(args, this.env.CACHE);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    this.server.tool(
      'kv_delete',
      'Delete key from Cloudflare KV storage',
      {
        key: z.string().describe('KV key to delete'),
      },
      async (args) => {
        const result = await kvDelete(args, this.env.CACHE);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    this.server.tool(
      'kv_list',
      'List keys in Cloudflare KV storage with optional prefix filter',
      {
        prefix: z.string().optional().describe('Key prefix filter (optional)'),
        limit: z.number().optional().describe('Maximum keys to return (default: 100)'),
      },
      async (args) => {
        const result = await kvList(args, this.env.CACHE);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    // ============================================
    // Workers AI Tools (3)
    // ============================================

    this.server.tool(
      'ai_chat',
      'Generate text using Cloudflare Workers AI LLM (chat completion)',
      {
        prompt: z.string().describe('User prompt for the LLM'),
        system_message: z.string().optional().describe('Optional system message to guide behavior'),
        max_tokens: z.number().optional().describe('Maximum tokens to generate (default: 256)'),
        model: z.string().optional().describe('Model to use (default: "@cf/meta/llama-3.1-8b-instruct")'),
      },
      async (args) => {
        const result = await aiChat(args, this.env.AI);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    this.server.tool(
      'ai_classify',
      'Classify text or perform sentiment analysis using Cloudflare Workers AI',
      {
        text: z.string().describe('Text to classify'),
        model: z.string().optional().describe('Model to use (default: "@cf/huggingface/distilbert-sst-2-int8")'),
      },
      async (args) => {
        const result = await aiClassify(args, this.env.AI);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    this.server.tool(
      'ai_embed',
      'Generate text embeddings using Cloudflare Workers AI (cached for efficiency)',
      {
        text: z.string().describe('Text to embed'),
        model: z.string().optional().describe('Model to use (default: "@cf/baai/bge-base-en-v1.5")'),
      },
      async (args) => {
        const result = await aiEmbed(args, this.env.AI, this.env.CACHE);
        return { content: [{ type: 'text', text: result }] };
      }
    );

    // Log authenticated user
    if (this.props) {
      console.log(`MCP session initialized for user: ${this.props.email}`);
    }
  }
}

/**
 * OAuth Provider - Main export
 * Handles OAuth flow and routes MCP requests to ToolboxMCP
 */
export default new OAuthProvider({
  apiHandlers: {
    '/sse': ToolboxMCP.serveSSE('/sse'),   // SSE protocol (legacy support)
    '/mcp': ToolboxMCP.serve('/mcp'),       // Streamable HTTP protocol
  },
  authorizeEndpoint: '/authorize',
  clientRegistrationEndpoint: '/register',
  defaultHandler: GoogleHandler as any,
  tokenEndpoint: '/token',
});
