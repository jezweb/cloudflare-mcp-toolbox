# API Endpoints: Cloudflare MCP Toolbox

**Base URL**: `https://[your-worker].workers.dev`
**MCP Endpoint**: `POST /mcp`
**Protocol**: JSON-RPC 2.0 (MCP Specification)
**Auth**: Bearer token in Authorization header

---

## MCP Protocol

### Initialize
**Method**: `initialize`
**Purpose**: Handshake to establish MCP connection

**Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05",
    "clientInfo": {
      "name": "BetterChat",
      "version": "1.0.0"
    }
  }
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "result": {
    "protocolVersion": "2024-11-05",
    "serverInfo": {
      "name": "cloudflare-mcp-toolbox",
      "version": "1.0.0"
    },
    "capabilities": {
      "tools": {}
    }
  }
}
```

---

### List Tools
**Method**: `tools/list`
**Purpose**: Get all available tools

**Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list"
}
```

**Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "result": {
    "tools": [
      {
        "name": "get_current_datetime",
        "description": "Get current date and time in specified timezone (defaults to Australia/Sydney)",
        "inputSchema": {
          "type": "object",
          "properties": {
            "timezone": {
              "type": "string",
              "description": "IANA timezone (e.g., 'America/New_York', 'Europe/London')"
            },
            "format": {
              "type": "string",
              "description": "Output format: 'iso' (default), 'unix', 'readable'"
            }
          }
        }
      }
      // ... 24 more tools
    ]
  }
}
```

---

## Date/Time Tools

### get_current_datetime
**Purpose**: Get current date and time in specified timezone

**Parameters**:
- `timezone` (optional, string): IANA timezone (default: "Australia/Sydney")
- `format` (optional, string): "iso" | "unix" | "readable" (default: "iso")

**Example Request**:
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "get_current_datetime",
    "arguments": {
      "timezone": "America/New_York",
      "format": "readable"
    }
  }
}
```

**Example Response**:
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "result": {
    "content": [
      {
        "type": "text",
        "text": "Monday, November 5, 2025 at 3:45 PM EST"
      }
    ]
  }
}
```

---

### convert_timezone
**Purpose**: Convert datetime from one timezone to another

**Parameters**:
- `datetime` (required, string): ISO 8601 datetime or unix timestamp
- `from_timezone` (required, string): Source timezone
- `to_timezone` (required, string): Target timezone
- `format` (optional, string): Output format (default: "iso")

**Example**:
```json
{
  "name": "convert_timezone",
  "arguments": {
    "datetime": "2025-11-05T15:30:00Z",
    "from_timezone": "UTC",
    "to_timezone": "Australia/Sydney",
    "format": "readable"
  }
}
```

**Response**: `"Wednesday, November 6, 2025 at 2:30 AM AEDT"`

---

### calculate_duration
**Purpose**: Calculate time difference between two dates

**Parameters**:
- `start` (required, string): Start datetime (ISO 8601 or unix timestamp)
- `end` (required, string): End datetime
- `unit` (optional, string): "seconds" | "minutes" | "hours" | "days" (default: "seconds")

**Example**:
```json
{
  "name": "calculate_duration",
  "arguments": {
    "start": "2025-11-01T00:00:00Z",
    "end": "2025-11-05T12:30:00Z",
    "unit": "hours"
  }
}
```

**Response**: `"108.5"`

---

### format_date
**Purpose**: Format date in various styles

**Parameters**:
- `datetime` (required, string): Input datetime
- `format` (required, string): "iso" | "relative" | "short" | "long" | "time_only" | "date_only"
- `timezone` (optional, string): Timezone for output (default: "Australia/Sydney")

**Example (relative)**:
```json
{
  "name": "format_date",
  "arguments": {
    "datetime": "2025-11-03T10:00:00Z",
    "format": "relative"
  }
}
```

**Response**: `"2 days ago"`

---

### parse_date
**Purpose**: Parse natural language date expressions

**Parameters**:
- `expression` (required, string): Natural language date ("tomorrow", "next Tuesday", "in 3 hours")
- `timezone` (optional, string): Reference timezone (default: "Australia/Sydney")
- `format` (optional, string): Output format (default: "iso")

**Example**:
```json
{
  "name": "parse_date",
  "arguments": {
    "expression": "next Friday at 3pm",
    "timezone": "Australia/Sydney"
  }
}
```

**Response**: `"2025-11-08T15:00:00+11:00"`

---

## Math & Calculation Tools

### calculate
**Purpose**: Evaluate mathematical expressions safely

**Parameters**:
- `expression` (required, string): Math expression (supports +, -, *, /, ^, sqrt, etc.)

**Example**:
```json
{
  "name": "calculate",
  "arguments": {
    "expression": "2 + 2 * 3 ^ 2"
  }
}
```

**Response**: `"20"`

**Security**: Expression is sanitized to prevent code injection. Only mathematical operators allowed.

---

### convert_units
**Purpose**: Convert between units of measurement

**Parameters**:
- `value` (required, number): Numeric value to convert
- `from_unit` (required, string): Source unit (e.g., "km", "lbs", "celsius")
- `to_unit` (required, string): Target unit (e.g., "miles", "kg", "fahrenheit")

**Supported Categories**:
- Length: m, km, cm, mm, miles, yards, feet, inches
- Weight: kg, g, mg, lbs, oz
- Temperature: celsius, fahrenheit, kelvin
- Volume: liters, ml, gallons, cups
- Time: seconds, minutes, hours, days, weeks

**Example**:
```json
{
  "name": "convert_units",
  "arguments": {
    "value": 100,
    "from_unit": "km",
    "to_unit": "miles"
  }
}
```

**Response**: `"62.137"`

---

### statistics
**Purpose**: Calculate statistical measures on array of numbers

**Parameters**:
- `numbers` (required, array of numbers): Dataset
- `metrics` (optional, array): Which metrics to calculate (default: all)
  - Options: "mean", "median", "mode", "stddev", "variance", "min", "max", "sum", "count"

**Example**:
```json
{
  "name": "statistics",
  "arguments": {
    "numbers": [1, 2, 2, 3, 4, 5, 5, 5, 6],
    "metrics": ["mean", "median", "mode"]
  }
}
```

**Response**:
```json
{
  "mean": 3.67,
  "median": 4,
  "mode": 5
}
```

---

### random_number
**Purpose**: Generate cryptographically secure random number

**Parameters**:
- `min` (optional, number): Minimum value (default: 0)
- `max` (optional, number): Maximum value (default: 1)
- `integer` (optional, boolean): Return integer instead of float (default: false)

**Example**:
```json
{
  "name": "random_number",
  "arguments": {
    "min": 1,
    "max": 100,
    "integer": true
  }
}
```

**Response**: `"42"`

---

### percentage
**Purpose**: Calculate percentages and percentage changes

**Parameters**:
- `operation` (required, string): "of" | "change" | "is_what_percent"
- `value1` (required, number): First value
- `value2` (required, number): Second value

**Example (15% of 200)**:
```json
{
  "name": "percentage",
  "arguments": {
    "operation": "of",
    "value1": 15,
    "value2": 200
  }
}
```

**Response**: `"30"`

**Example (percentage change from 100 to 150)**:
```json
{
  "name": "percentage",
  "arguments": {
    "operation": "change",
    "value1": 100,
    "value2": 150
  }
}
```

**Response**: `"50%"` (increase)

---

## Text Processing Tools

### transform_text
**Purpose**: Transform text in various ways

**Parameters**:
- `text` (required, string): Input text
- `operation` (required, string): "uppercase" | "lowercase" | "titlecase" | "slug" | "trim" | "reverse"

**Example (slug)**:
```json
{
  "name": "transform_text",
  "arguments": {
    "text": "Hello World! This is a Test.",
    "operation": "slug"
  }
}
```

**Response**: `"hello-world-this-is-a-test"`

---

### encode_decode
**Purpose**: Encode or decode text in various formats

**Parameters**:
- `text` (required, string): Input text
- `operation` (required, string): "base64_encode" | "base64_decode" | "url_encode" | "url_decode" | "html_escape" | "html_unescape"

**Example**:
```json
{
  "name": "encode_decode",
  "arguments": {
    "text": "Hello World!",
    "operation": "base64_encode"
  }
}
```

**Response**: `"SGVsbG8gV29ybGQh"`

---

### extract_patterns
**Purpose**: Extract patterns from text using regex

**Parameters**:
- `text` (required, string): Input text
- `pattern` (required, string): "emails" | "urls" | "phone_numbers" | "hashtags" | "mentions" | "custom"
- `custom_regex` (optional, string): Custom regex pattern (if pattern="custom")

**Example**:
```json
{
  "name": "extract_patterns",
  "arguments": {
    "text": "Contact us at support@example.com or visit https://example.com",
    "pattern": "emails"
  }
}
```

**Response**: `["support@example.com"]`

---

### hash_text
**Purpose**: Generate cryptographic hash of text

**Parameters**:
- `text` (required, string): Input text
- `algorithm` (required, string): "sha256" | "sha1" | "md5"
- `output_format` (optional, string): "hex" | "base64" (default: "hex")

**Example**:
```json
{
  "name": "hash_text",
  "arguments": {
    "text": "Hello World",
    "algorithm": "sha256"
  }
}
```

**Response**: `"a591a6d40bf420404a011733cfb7b190d62c65bf0bcda32b57b277d9ad9f146e"`

---

### count_words
**Purpose**: Count words, characters, sentences in text

**Parameters**:
- `text` (required, string): Input text
- `metrics` (optional, array): ["words", "characters", "sentences", "paragraphs"] (default: all)

**Example**:
```json
{
  "name": "count_words",
  "arguments": {
    "text": "Hello world! This is a test.",
    "metrics": ["words", "characters"]
  }
}
```

**Response**:
```json
{
  "words": 6,
  "characters": 28
}
```

---

### truncate_text
**Purpose**: Truncate text to specified length with smart word boundaries

**Parameters**:
- `text` (required, string): Input text
- `max_length` (required, number): Maximum length
- `ellipsis` (optional, boolean): Add "..." at end (default: true)
- `break_words` (optional, boolean): Allow breaking mid-word (default: false)

**Example**:
```json
{
  "name": "truncate_text",
  "arguments": {
    "text": "This is a very long sentence that needs to be truncated",
    "max_length": 30,
    "break_words": false
  }
}
```

**Response**: `"This is a very long sentence..."`

---

## Data Validation Tools

### validate_email
**Purpose**: Validate email address format

**Parameters**:
- `email` (required, string): Email address to validate

**Example**:
```json
{
  "name": "validate_email",
  "arguments": {
    "email": "user@example.com"
  }
}
```

**Response**:
```json
{
  "valid": true,
  "email": "user@example.com"
}
```

**Invalid Response**:
```json
{
  "valid": false,
  "error": "Missing @ symbol"
}
```

---

### validate_url
**Purpose**: Validate URL format and structure

**Parameters**:
- `url` (required, string): URL to validate
- `require_protocol` (optional, boolean): Require http/https (default: true)

**Example**:
```json
{
  "name": "validate_url",
  "arguments": {
    "url": "https://example.com/path?query=value"
  }
}
```

**Response**:
```json
{
  "valid": true,
  "protocol": "https",
  "domain": "example.com",
  "path": "/path",
  "query": "query=value"
}
```

---

### validate_phone
**Purpose**: Validate phone number format

**Parameters**:
- `phone` (required, string): Phone number to validate
- `country_code` (optional, string): Expected country code (e.g., "AU", "US")

**Example**:
```json
{
  "name": "validate_phone",
  "arguments": {
    "phone": "+61411056876",
    "country_code": "AU"
  }
}
```

**Response**:
```json
{
  "valid": true,
  "formatted": "+61 411 056 876",
  "country_code": "AU"
}
```

---

### validate_json
**Purpose**: Validate JSON structure

**Parameters**:
- `json_string` (required, string): JSON string to validate

**Example**:
```json
{
  "name": "validate_json",
  "arguments": {
    "json_string": "{\"name\": \"John\", \"age\": 30}"
  }
}
```

**Response**:
```json
{
  "valid": true,
  "parsed": {
    "name": "John",
    "age": 30
  }
}
```

**Invalid Response**:
```json
{
  "valid": false,
  "error": "Unexpected token } at position 15"
}
```

---

### sanitize_html
**Purpose**: Sanitize HTML content (strip or escape tags)

**Parameters**:
- `html` (required, string): HTML to sanitize
- `mode` (required, string): "strip" (remove tags) | "escape" (convert to entities)

**Example (strip)**:
```json
{
  "name": "sanitize_html",
  "arguments": {
    "html": "<p>Hello <script>alert('xss')</script>World</p>",
    "mode": "strip"
  }
}
```

**Response**: `"Hello World"`

**Example (escape)**:
```json
{
  "name": "sanitize_html",
  "arguments": {
    "html": "<p>Hello World</p>",
    "mode": "escape"
  }
}
```

**Response**: `"&lt;p&gt;Hello World&lt;/p&gt;"`

---

### validate_schema
**Purpose**: Validate data against JSON schema

**Parameters**:
- `data` (required, object): Data to validate
- `schema` (required, object): JSON Schema specification

**Example**:
```json
{
  "name": "validate_schema",
  "arguments": {
    "data": {
      "name": "John",
      "age": 30
    },
    "schema": {
      "type": "object",
      "required": ["name", "age"],
      "properties": {
        "name": { "type": "string" },
        "age": { "type": "number", "minimum": 0 }
      }
    }
  }
}
```

**Response**:
```json
{
  "valid": true
}
```

**Invalid Response**:
```json
{
  "valid": false,
  "errors": [
    "Missing required field: age",
    "Field 'age' must be a number"
  ]
}
```

---

## KV Storage Tools

### kv_get
**Purpose**: Retrieve value from KV store

**Parameters**:
- `key` (required, string): Key to retrieve
- `type` (optional, string): "text" | "json" (default: "text")

**Example**:
```json
{
  "name": "kv_get",
  "arguments": {
    "key": "user_settings",
    "type": "json"
  }
}
```

**Response**:
```json
{
  "found": true,
  "value": {
    "theme": "dark",
    "language": "en"
  }
}
```

**Not Found Response**:
```json
{
  "found": false,
  "value": null
}
```

---

### kv_set
**Purpose**: Store value in KV

**Parameters**:
- `key` (required, string): Key to store
- `value` (required, string | object): Value to store (objects auto-serialized to JSON)
- `ttl` (optional, number): Time to live in seconds (default: no expiration)

**Example**:
```json
{
  "name": "kv_set",
  "arguments": {
    "key": "cache_result",
    "value": {"result": "computed data"},
    "ttl": 3600
  }
}
```

**Response**:
```json
{
  "success": true,
  "key": "cache_result",
  "expires_at": 1730894400
}
```

---

### kv_delete
**Purpose**: Delete key from KV

**Parameters**:
- `key` (required, string): Key to delete

**Example**:
```json
{
  "name": "kv_delete",
  "arguments": {
    "key": "old_cache"
  }
}
```

**Response**:
```json
{
  "success": true,
  "deleted": "old_cache"
}
```

---

### kv_list
**Purpose**: List keys in KV namespace

**Parameters**:
- `prefix` (optional, string): Filter by key prefix
- `limit` (optional, number): Max keys to return (default: 100, max: 1000)

**Example**:
```json
{
  "name": "kv_list",
  "arguments": {
    "prefix": "user_",
    "limit": 10
  }
}
```

**Response**:
```json
{
  "keys": [
    {"name": "user_123", "expiration": null},
    {"name": "user_456", "expiration": 1730894400}
  ],
  "count": 2,
  "cursor": null
}
```

---

## Workers AI Tools

### ai_chat
**Purpose**: LLM inference for chat completions

**Parameters**:
- `prompt` (required, string): User prompt/question
- `system_message` (optional, string): System message to guide behavior
- `max_tokens` (optional, number): Maximum response tokens (default: 256)
- `model` (optional, string): Model to use (default: "@cf/meta/llama-3.1-8b-instruct")

**Example**:
```json
{
  "name": "ai_chat",
  "arguments": {
    "prompt": "What is the capital of Australia?",
    "system_message": "You are a helpful geography assistant.",
    "max_tokens": 100
  }
}
```

**Response**:
```json
{
  "response": "The capital of Australia is Canberra.",
  "model": "@cf/meta/llama-3.1-8b-instruct",
  "tokens_used": 12
}
```

**Available Models**:
- `@cf/meta/llama-3.1-8b-instruct` (default, fast, balanced)
- `@cf/mistral/mistral-7b-instruct-v0.1`
- `@cf/meta/llama-2-7b-chat-int8`

---

### ai_classify
**Purpose**: Text classification (sentiment, category, moderation)

**Parameters**:
- `text` (required, string): Text to classify
- `model` (optional, string): Model to use (default: "@cf/huggingface/distilbert-sst-2-int8")

**Example**:
```json
{
  "name": "ai_classify",
  "arguments": {
    "text": "This product is amazing! I love it."
  }
}
```

**Response**:
```json
{
  "classification": "POSITIVE",
  "score": 0.9987,
  "model": "@cf/huggingface/distilbert-sst-2-int8"
}
```

**Available Models**:
- `@cf/huggingface/distilbert-sst-2-int8` (sentiment: POSITIVE/NEGATIVE)

---

### ai_embed
**Purpose**: Generate text embeddings for semantic search

**Parameters**:
- `text` (required, string): Text to embed
- `model` (optional, string): Model to use (default: "@cf/baai/bge-base-en-v1.5")

**Example**:
```json
{
  "name": "ai_embed",
  "arguments": {
    "text": "Cloudflare Workers are serverless functions"
  }
}
```

**Response**:
```json
{
  "embedding": [0.123, -0.456, 0.789, ...],
  "dimensions": 768,
  "model": "@cf/baai/bge-base-en-v1.5"
}
```

**Available Models**:
- `@cf/baai/bge-base-en-v1.5` (768 dimensions)
- `@cf/baai/bge-small-en-v1.5` (384 dimensions)
- `@cf/baai/bge-large-en-v1.5` (1024 dimensions)

**Use Cases**:
- Semantic search (store embeddings in Vectorize)
- Document similarity
- Clustering/categorization

---

## Error Handling

All errors follow JSON-RPC 2.0 format:

```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "error": {
    "code": -32602,
    "message": "Invalid params: missing required parameter 'text'"
  }
}
```

**Standard Error Codes**:
- `-32700`: Parse error (invalid JSON)
- `-32600`: Invalid request (missing jsonrpc field)
- `-32601`: Method not found (unknown MCP method)
- `-32602`: Invalid params (missing/wrong tool parameters)
- `-32603`: Internal error (server-side failure)

**HTTP Status Codes**:
- `200`: Success (even for MCP errors - check error field)
- `401`: Unauthorized (missing or invalid Bearer token)
- `400`: Malformed request (not valid JSON)

---

## BetterChat Configuration

Add this MCP server to BetterChat:

```json
{
  "url": "https://your-worker.workers.dev/mcp",
  "headers": {
    "Authorization": "Bearer your-auth-token-here"
  }
}
```

**Get AUTH_TOKEN**: Contact server administrator or check wrangler.jsonc (for self-hosted)

---

## Rate Limiting

Currently: **No rate limiting**

Future: KV-based rate limiting (e.g., 1000 requests/hour per token)

---

## Caching

**AI Embeddings**: Automatically cached in KV by input hash (7-day TTL)
- Reduces AI quota usage for repeated embedding requests
- Cache key format: `embed:sha256(text)`

**Other Tools**: No automatic caching (use `kv_set` to cache manually)

---

## Tool Usage Examples

### Example 1: Date Calculation Workflow
```javascript
// 1. Get current time in Sydney
ai_chat("What's the current time?")
  → calls get_current_datetime({ timezone: "Australia/Sydney" })

// 2. Calculate deadline (3 days from now)
parse_date({ expression: "in 3 days", timezone: "Australia/Sydney" })
  → "2025-11-08T14:30:00+11:00"

// 3. Format for user
format_date({ datetime: "2025-11-08T14:30:00+11:00", format: "long" })
  → "Friday, November 8, 2025 at 2:30 PM AEDT"
```

### Example 2: Data Processing Workflow
```javascript
// 1. Extract emails from text
extract_patterns({ text: "Contact sales@acme.com or support@acme.com", pattern: "emails" })
  → ["sales@acme.com", "support@acme.com"]

// 2. Validate each email
validate_email({ email: "sales@acme.com" })
  → { valid: true, email: "sales@acme.com" }

// 3. Store in KV
kv_set({ key: "contacts", value: ["sales@acme.com", "support@acme.com"] })
  → { success: true }
```

### Example 3: AI-Powered Text Analysis
```javascript
// 1. Classify sentiment
ai_classify({ text: "This is terrible, I hate it!" })
  → { classification: "NEGATIVE", score: 0.9954 }

// 2. Generate embedding for search
ai_embed({ text: "Cloudflare Workers documentation" })
  → { embedding: [...], dimensions: 768 }

// 3. Cache result
kv_set({
  key: "analysis_abc123",
  value: { sentiment: "NEGATIVE", score: 0.9954 },
  ttl: 86400
})
```

---

## Total Tools: 25

**Date/Time**: 5 | **Math**: 5 | **Text**: 6 | **Validation**: 6 | **KV**: 4 | **Workers AI**: 3
