# Cloudflare MCP Toolbox

[![Deploy to Cloudflare Workers](https://deploy.workers.cloudflare.com/button)](https://deploy.workers.cloudflare.com/?url=https://github.com/jezweb/cloudflare-mcp-toolbox)

**Utility tools for AI agents** - date/time, math, text processing, validation, KV storage, and Workers AI integration.

Built on Cloudflare Workers for global edge deployment with zero cold starts.

**Live Demo**: [https://cloudflare-mcp-toolbox.webfonts.workers.dev](https://cloudflare-mcp-toolbox.webfonts.workers.dev)

---

## 🚀 Features

- **30 Utility Tools** across 6 categories
- **Australia/Sydney timezone** as default for all date/time operations
- **Bearer token authentication** for secure access
- **Cloudflare Workers AI integration** with automatic embedding caching
- **Edge deployment** with global low-latency access
- **MCP Protocol compliant** (Model Context Protocol)

---

## 📦 Tool Categories

| Category | Tools | Description |
|----------|-------|-------------|
| **Date/Time** (5) | get_current_datetime, convert_timezone, calculate_duration, format_date, parse_date | Timezone conversion, duration calculations, natural language date parsing |
| **Math** (6) | calculate, convert_units, statistics, random_number, percentage, roll_dice | Safe expression evaluation, unit conversions, crypto-secure random, dice rolling |
| **Text** (6) | transform_text, encode_decode, extract_patterns, hash_text, count_words, truncate_text | Text transformation, encoding, pattern extraction, hashing |
| **Validation** (6) | validate_email, validate_url, validate_phone, validate_json, sanitize_html, validate_schema | Input validation and sanitization |
| **KV Storage** (4) | kv_get, kv_set, kv_delete, kv_list | Persistent key-value storage with TTL |
| **Workers AI** (3) | ai_chat, ai_classify, ai_embed | LLM inference, sentiment analysis, text embeddings |

---

## 🔧 Setup

### Prerequisites
- Node.js 18+
- Cloudflare account with Workers AI enabled
- Wrangler CLI

### Installation

```bash
npm install
```

### Configuration

1. **KV Namespace**:
   ```bash
   wrangler kv namespace create MCP_TOOLBOX_CACHE
   ```

   Update `wrangler.jsonc` with the returned ID:
   ```jsonc
   "kv_namespaces": [
     {
       "binding": "CACHE",
       "id": "YOUR_KV_NAMESPACE_ID"
     }
   ]
   ```

2. **Generate AUTH_TOKEN**:
   ```bash
   node -e "console.log(require('crypto').randomBytes(32).toString('base64url'))"
   ```

   Update `wrangler.jsonc`:
   ```jsonc
   "vars": {
     "AUTH_TOKEN": "YOUR_GENERATED_TOKEN_HERE"
   }
   ```

### Deploy

```bash
npm run deploy
```

### Local Development

```bash
npm run dev
```

Server will start at `http://localhost:8787`

---

## 📖 Usage

### BetterChat Configuration

Add to your BetterChat MCP servers config:

```json
{
  "url": "https://your-worker.workers.dev/mcp",
  "headers": {
    "Authorization": "Bearer YOUR_AUTH_TOKEN_HERE"
  }
}
```

### Claude Desktop

Add to `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "cloudflare-toolbox": {
      "command": "npx",
      "args": ["-y", "mcp-remote", "https://your-worker.workers.dev/mcp"],
      "env": {
        "MCP_REMOTE_HEADERS": "{\"Authorization\":\"Bearer YOUR_TOKEN\"}"
      }
    }
  }
}
```

### MCP Inspector (Testing)

```bash
npx @modelcontextprotocol/inspector \
  https://your-worker.workers.dev/mcp \
  -H "Authorization: Bearer YOUR_TOKEN"
```

### MCP Protocol

**Initialize:**
```json
{
  "jsonrpc": "2.0",
  "id": 1,
  "method": "initialize",
  "params": {
    "protocolVersion": "2024-11-05"
  }
}
```

**List Tools:**
```json
{
  "jsonrpc": "2.0",
  "id": 2,
  "method": "tools/list"
}
```

**Call Tool:**
```json
{
  "jsonrpc": "2.0",
  "id": 3,
  "method": "tools/call",
  "params": {
    "name": "get_current_datetime",
    "arguments": {}
  }
}
```

---

## 🎯 Example Tool Calls

### Date/Time
```javascript
// Get current time in Sydney
get_current_datetime({ timezone: "Australia/Sydney", format: "readable" })
// → "Wednesday, November 6, 2025 at 2:30 PM AEDT"

// Parse natural language
parse_date({ expression: "next Friday at 3pm" })
// → "2025-11-08T15:00:00+11:00"
```

### Math
```javascript
// Calculate expression
calculate({ expression: "2 + 2 * 3" })
// → "8"

// Roll dice
roll_dice({ notation: "2d6+5" })
// → { "rolls": [3, 5], "sum": 8, "total": 13 }

// Convert units
convert_units({ value: 100, from_unit: "km", to_unit: "miles" })
// → "62.137"
```

### Text
```javascript
// Transform text
transform_text({ text: "Hello World", operation: "slug" })
// → "hello-world"

// Extract emails
extract_patterns({ text: "Contact us at support@example.com", pattern: "emails" })
// → ["support@example.com"]
```

### Validation
```javascript
// Validate email
validate_email({ email: "user@example.com" })
// → { "valid": true, "email": "user@example.com" }

// Sanitize HTML
sanitize_html({ html: "<script>alert('xss')</script>Hello", mode: "strip" })
// → "Hello"
```

### KV Storage
```javascript
// Store data
kv_set({ key: "user_prefs", value: { theme: "dark" }, ttl: 3600 })
// → { "success": true, "expires_at": 1730894400 }

// Retrieve data
kv_get({ key: "user_prefs", type: "json" })
// → { "found": true, "value": { "theme": "dark" } }
```

### Workers AI
```javascript
// Chat completion
ai_chat({ prompt: "What is the capital of Australia?" })
// → { "response": "The capital of Australia is Canberra.", ... }

// Sentiment analysis
ai_classify({ text: "This is amazing!" })
// → { "classification": "POSITIVE", "score": 0.9987 }

// Generate embeddings (cached)
ai_embed({ text: "Cloudflare Workers are serverless functions" })
// → { "embedding": [...], "dimensions": 768 }
```

---

## 🔒 Security

- **Bearer Token Authentication**: All MCP endpoints require valid `Authorization: Bearer TOKEN` header
- **Input Validation**: All inputs validated before processing
- **Safe Expression Evaluation**: Math expressions use recursive descent parser (no `eval()` or `Function()`)
- **HTML Sanitization**: XSS protection via tag stripping or entity escaping
- **Rate Limiting**: Can be added via KV-based tracking (see Phase 8 docs)

---

## 📚 Documentation

- **API Endpoints**: See `docs/API_ENDPOINTS.md` for complete tool documentation
- **Implementation**: See `docs/IMPLEMENTATION_PHASES.md` for build phases
- **MCP Protocol**: https://modelcontextprotocol.io

---

## 🛠️ Development

### Project Structure
```
cloudflare-mcp-toolbox/
├── src/
│   ├── index.ts              # Main Hono app + auth
│   ├── mcp/
│   │   ├── server.ts         # MCP request handler
│   │   ├── types.ts          # TypeScript types
│   │   └── tools.ts          # Tool definitions (30 tools)
│   ├── handlers/             # Tool implementations
│   │   ├── datetime.ts       # Date/time tools (5)
│   │   ├── math.ts           # Math tools (6)
│   │   ├── text.ts           # Text tools (6)
│   │   ├── validation.ts     # Validation tools (6)
│   │   ├── kv.ts             # KV tools (4)
│   │   └── ai.ts             # AI tools (3)
│   └── utils/
│       └── responses.ts      # MCP response builders
├── docs/
│   ├── API_ENDPOINTS.md      # Complete tool documentation
│   └── IMPLEMENTATION_PHASES.md  # Build phases
├── wrangler.jsonc            # Cloudflare config
├── package.json
└── tsconfig.json
```

### Adding New Tools

1. Create handler function in appropriate `src/handlers/*.ts` file
2. Add tool definition to `src/mcp/tools.ts`
3. Wire handler in `src/mcp/server.ts` switch statement
4. Test locally with `npm run dev`
5. Deploy with `npm run deploy`

---

## 🚦 Status

✅ All 30 tools implemented and tested
✅ Deployed to Cloudflare Workers
✅ Bearer token authentication enabled
✅ KV namespace configured
✅ Workers AI binding active
✅ Production ready

---

## 📝 License

MIT

---

## 👤 Author

Jeremy Dawes (Jez)
Jezweb | AI Engineer
jeremy@jezweb.net | www.jezweb.com.au

---

## 🙏 Built With

- [Cloudflare Workers](https://workers.cloudflare.com/) - Serverless edge platform
- [Hono](https://hono.dev/) - Lightweight web framework
- [Workers AI](https://ai.cloudflare.com/) - LLM inference at the edge
- [Cloudflare KV](https://developers.cloudflare.com/kv/) - Key-value storage
- [MCP Protocol](https://modelcontextprotocol.io/) - Model Context Protocol

---

**Total Tools**: 30
**Categories**: 6
**Global Edge Deployment**: ✅
**Cold Start Time**: 0ms
**Authentication**: Bearer Token
**Default Timezone**: Australia/Sydney
