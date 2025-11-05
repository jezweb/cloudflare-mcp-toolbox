/**
 * MCP Tools Registry
 * Central registry of all available tools
 */

import type { MCPTool } from './types'

export const MCP_TOOLS: MCPTool[] = [
  // Phase 2: Date/Time tools
  {
    name: 'get_current_datetime',
    description: 'Get current date and time in specified timezone (defaults to Australia/Sydney)',
    inputSchema: {
      type: 'object',
      properties: {
        timezone: {
          type: 'string',
          description: 'IANA timezone (e.g., "America/New_York", "Europe/London"). Default: "Australia/Sydney"',
        },
        format: {
          type: 'string',
          enum: ['iso', 'unix', 'readable'],
          description: 'Output format: "iso" (ISO 8601), "unix" (timestamp), "readable" (human-friendly). Default: "iso"',
        },
      },
    },
  },
  {
    name: 'convert_timezone',
    description: 'Convert datetime from one timezone to another',
    inputSchema: {
      type: 'object',
      properties: {
        datetime: {
          type: 'string',
          description: 'Input datetime (ISO 8601 string or unix timestamp)',
        },
        from_timezone: {
          type: 'string',
          description: 'Source timezone (IANA format)',
        },
        to_timezone: {
          type: 'string',
          description: 'Target timezone (IANA format)',
        },
        format: {
          type: 'string',
          enum: ['iso', 'unix', 'readable'],
          description: 'Output format. Default: "iso"',
        },
      },
      required: ['datetime', 'from_timezone', 'to_timezone'],
    },
  },
  {
    name: 'calculate_duration',
    description: 'Calculate time difference between two dates',
    inputSchema: {
      type: 'object',
      properties: {
        start: {
          type: 'string',
          description: 'Start datetime (ISO 8601 or unix timestamp)',
        },
        end: {
          type: 'string',
          description: 'End datetime (ISO 8601 or unix timestamp)',
        },
        unit: {
          type: 'string',
          enum: ['seconds', 'minutes', 'hours', 'days'],
          description: 'Unit for result. Default: "seconds"',
        },
      },
      required: ['start', 'end'],
    },
  },
  {
    name: 'format_date',
    description: 'Format date in various styles',
    inputSchema: {
      type: 'object',
      properties: {
        datetime: {
          type: 'string',
          description: 'Input datetime (ISO 8601 or unix timestamp)',
        },
        format: {
          type: 'string',
          enum: ['iso', 'relative', 'short', 'long', 'time_only', 'date_only'],
          description: 'Format style: "iso", "relative" (e.g. "2 days ago"), "short", "long", "time_only", "date_only"',
        },
        timezone: {
          type: 'string',
          description: 'Timezone for output. Default: "Australia/Sydney"',
        },
      },
      required: ['datetime', 'format'],
    },
  },
  {
    name: 'parse_date',
    description: 'Parse natural language date expressions like "tomorrow", "in 3 days", "next Friday"',
    inputSchema: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'Natural language expression (e.g., "tomorrow", "in 3 hours", "next Monday", "2 days ago")',
        },
        timezone: {
          type: 'string',
          description: 'Reference timezone. Default: "Australia/Sydney"',
        },
        format: {
          type: 'string',
          enum: ['iso', 'unix', 'readable'],
          description: 'Output format. Default: "iso"',
        },
      },
      required: ['expression'],
    },
  },

  // Phase 3: Math/Calculation tools
  {
    name: 'calculate',
    description: 'Safely evaluate mathematical expressions. Supports +, -, *, /, ^, sqrt, pow, abs, sin, cos, tan, log, exp',
    inputSchema: {
      type: 'object',
      properties: {
        expression: {
          type: 'string',
          description: 'Mathematical expression (e.g., "2 + 2 * 3", "sqrt(16)", "2^3")',
        },
      },
      required: ['expression'],
    },
  },
  {
    name: 'convert_units',
    description: 'Convert between units of measurement (length, weight, volume, time, temperature)',
    inputSchema: {
      type: 'object',
      properties: {
        value: {
          type: 'number',
          description: 'Numeric value to convert',
        },
        from_unit: {
          type: 'string',
          description: 'Source unit (e.g., "km", "lbs", "celsius", "liters")',
        },
        to_unit: {
          type: 'string',
          description: 'Target unit (e.g., "miles", "kg", "fahrenheit", "gallons")',
        },
      },
      required: ['value', 'from_unit', 'to_unit'],
    },
  },
  {
    name: 'statistics',
    description: 'Calculate statistical measures on an array of numbers',
    inputSchema: {
      type: 'object',
      properties: {
        numbers: {
          type: 'array',
          items: { type: 'number' },
          description: 'Array of numbers to analyze',
        },
        metrics: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['mean', 'median', 'mode', 'stddev', 'variance', 'min', 'max', 'sum', 'count'],
          },
          description: 'Metrics to calculate (default: all)',
        },
      },
      required: ['numbers'],
    },
  },
  {
    name: 'random_number',
    description: 'Generate cryptographically secure random number in specified range',
    inputSchema: {
      type: 'object',
      properties: {
        min: {
          type: 'number',
          description: 'Minimum value (default: 0)',
        },
        max: {
          type: 'number',
          description: 'Maximum value (default: 1)',
        },
        integer: {
          type: 'boolean',
          description: 'Return integer instead of float (default: false)',
        },
      },
    },
  },
  {
    name: 'percentage',
    description: 'Calculate percentages and percentage changes',
    inputSchema: {
      type: 'object',
      properties: {
        operation: {
          type: 'string',
          enum: ['of', 'change', 'is_what_percent'],
          description: '"of" (X% of Y), "change" (% change from X to Y), "is_what_percent" (X is what % of Y)',
        },
        value1: {
          type: 'number',
          description: 'First value',
        },
        value2: {
          type: 'number',
          description: 'Second value',
        },
      },
      required: ['operation', 'value1', 'value2'],
    },
  },

  {
    name: 'roll_dice',
    description: 'Roll dice using standard notation (e.g., "2d6", "1d20+5", "3d8-2")',
    inputSchema: {
      type: 'object',
      properties: {
        notation: {
          type: 'string',
          description: 'Dice notation (e.g., "2d6" for two six-sided dice, "1d20+5" for one d20 with +5 modifier)',
        },
      },
      required: ['notation'],
    },
  },

  // Phase 4: Text processing tools
  {
    name: 'transform_text',
    description: 'Transform text in various ways (uppercase, lowercase, titlecase, slug, trim, reverse)',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Text to transform',
        },
        operation: {
          type: 'string',
          enum: ['uppercase', 'lowercase', 'titlecase', 'slug', 'trim', 'reverse'],
          description: 'Transformation to apply',
        },
      },
      required: ['text', 'operation'],
    },
  },
  {
    name: 'encode_decode',
    description: 'Encode or decode text using various formats (base64, URL, HTML)',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Text to encode or decode',
        },
        operation: {
          type: 'string',
          enum: ['base64_encode', 'base64_decode', 'url_encode', 'url_decode', 'html_escape', 'html_unescape'],
          description: 'Encoding/decoding operation to perform',
        },
      },
      required: ['text', 'operation'],
    },
  },
  {
    name: 'extract_patterns',
    description: 'Extract patterns from text using predefined or custom regex (emails, URLs, phone numbers, hashtags, mentions)',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Text to search',
        },
        pattern: {
          type: 'string',
          enum: ['emails', 'urls', 'phone_numbers', 'hashtags', 'mentions', 'custom'],
          description: 'Pattern type to extract',
        },
        custom_regex: {
          type: 'string',
          description: 'Custom regex pattern (required when pattern is "custom")',
        },
      },
      required: ['text', 'pattern'],
    },
  },
  {
    name: 'hash_text',
    description: 'Hash text using SHA-256, SHA-1, or MD5 (uses SHA-256 for MD5 fallback)',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Text to hash',
        },
        algorithm: {
          type: 'string',
          enum: ['sha256', 'sha1', 'md5'],
          description: 'Hash algorithm to use',
        },
        output_format: {
          type: 'string',
          enum: ['hex', 'base64'],
          description: 'Output format (default: "hex")',
        },
      },
      required: ['text', 'algorithm'],
    },
  },
  {
    name: 'count_words',
    description: 'Count words, characters, sentences, and paragraphs in text',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Text to analyze',
        },
        metrics: {
          type: 'array',
          items: {
            type: 'string',
            enum: ['words', 'characters', 'sentences', 'paragraphs'],
          },
          description: 'Metrics to calculate (default: all)',
        },
      },
      required: ['text'],
    },
  },
  {
    name: 'truncate_text',
    description: 'Truncate text to specified length with optional ellipsis and word boundary preservation',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Text to truncate',
        },
        max_length: {
          type: 'number',
          description: 'Maximum length of output',
        },
        ellipsis: {
          type: 'boolean',
          description: 'Add ellipsis (...) at end (default: true)',
        },
        break_words: {
          type: 'boolean',
          description: 'Allow breaking in middle of words (default: false)',
        },
      },
      required: ['text', 'max_length'],
    },
  },

  // Phase 5: Data validation tools
  {
    name: 'validate_email',
    description: 'Validate email address format',
    inputSchema: {
      type: 'object',
      properties: {
        email: {
          type: 'string',
          description: 'Email address to validate',
        },
      },
      required: ['email'],
    },
  },
  {
    name: 'validate_url',
    description: 'Validate URL format and parse components (protocol, domain, path, query)',
    inputSchema: {
      type: 'object',
      properties: {
        url: {
          type: 'string',
          description: 'URL to validate',
        },
        require_protocol: {
          type: 'boolean',
          description: 'Require http/https protocol (default: true)',
        },
      },
      required: ['url'],
    },
  },
  {
    name: 'validate_phone',
    description: 'Validate phone number format and format for display',
    inputSchema: {
      type: 'object',
      properties: {
        phone: {
          type: 'string',
          description: 'Phone number to validate',
        },
        country_code: {
          type: 'string',
          description: 'Optional country code (e.g., "US", "AU")',
        },
      },
      required: ['phone'],
    },
  },
  {
    name: 'validate_json',
    description: 'Validate JSON string and parse it',
    inputSchema: {
      type: 'object',
      properties: {
        json_string: {
          type: 'string',
          description: 'JSON string to validate',
        },
      },
      required: ['json_string'],
    },
  },
  {
    name: 'sanitize_html',
    description: 'Sanitize HTML by stripping tags or escaping entities',
    inputSchema: {
      type: 'object',
      properties: {
        html: {
          type: 'string',
          description: 'HTML content to sanitize',
        },
        mode: {
          type: 'string',
          enum: ['strip', 'escape'],
          description: '"strip" removes all tags, "escape" converts to HTML entities',
        },
      },
      required: ['html', 'mode'],
    },
  },
  {
    name: 'validate_schema',
    description: 'Validate data against a simple JSON schema',
    inputSchema: {
      type: 'object',
      properties: {
        data: {
          description: 'Data to validate',
        },
        schema: {
          type: 'object',
          description: 'Schema definition with type, required, and properties',
          properties: {
            type: {
              type: 'string',
              description: 'Expected data type',
            },
            required: {
              type: 'array',
              items: { type: 'string' },
              description: 'Required fields (for objects)',
            },
            properties: {
              type: 'object',
              description: 'Property definitions (for objects)',
            },
          },
        },
      },
      required: ['data', 'schema'],
    },
  },

  // Phase 6: KV storage tools
  {
    name: 'kv_get',
    description: 'Get value from Cloudflare KV storage',
    inputSchema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'KV key to retrieve',
        },
        type: {
          type: 'string',
          enum: ['text', 'json'],
          description: 'Value type (default: "text")',
        },
      },
      required: ['key'],
    },
  },
  {
    name: 'kv_set',
    description: 'Set value in Cloudflare KV storage with optional TTL',
    inputSchema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'KV key to set',
        },
        value: {
          description: 'Value to store (string or JSON-serializable object)',
        },
        ttl: {
          type: 'number',
          description: 'Time-to-live in seconds (optional)',
        },
      },
      required: ['key', 'value'],
    },
  },
  {
    name: 'kv_delete',
    description: 'Delete key from Cloudflare KV storage',
    inputSchema: {
      type: 'object',
      properties: {
        key: {
          type: 'string',
          description: 'KV key to delete',
        },
      },
      required: ['key'],
    },
  },
  {
    name: 'kv_list',
    description: 'List keys in Cloudflare KV storage with optional prefix filter',
    inputSchema: {
      type: 'object',
      properties: {
        prefix: {
          type: 'string',
          description: 'Key prefix filter (optional)',
        },
        limit: {
          type: 'number',
          description: 'Maximum keys to return (default: 100)',
        },
      },
    },
  },

  // Phase 7: Workers AI tools
  {
    name: 'ai_chat',
    description: 'Generate text using Cloudflare Workers AI LLM (chat completion)',
    inputSchema: {
      type: 'object',
      properties: {
        prompt: {
          type: 'string',
          description: 'User prompt for the LLM',
        },
        system_message: {
          type: 'string',
          description: 'Optional system message to guide behavior',
        },
        max_tokens: {
          type: 'number',
          description: 'Maximum tokens to generate (default: 256)',
        },
        model: {
          type: 'string',
          description: 'Model to use (default: "@cf/meta/llama-3.1-8b-instruct")',
        },
      },
      required: ['prompt'],
    },
  },
  {
    name: 'ai_classify',
    description: 'Classify text or perform sentiment analysis using Cloudflare Workers AI',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Text to classify',
        },
        model: {
          type: 'string',
          description: 'Model to use (default: "@cf/huggingface/distilbert-sst-2-int8")',
        },
      },
      required: ['text'],
    },
  },
  {
    name: 'ai_embed',
    description: 'Generate text embeddings using Cloudflare Workers AI (cached for efficiency)',
    inputSchema: {
      type: 'object',
      properties: {
        text: {
          type: 'string',
          description: 'Text to embed',
        },
        model: {
          type: 'string',
          description: 'Model to use (default: "@cf/baai/bge-base-en-v1.5")',
        },
      },
      required: ['text'],
    },
  },
]
