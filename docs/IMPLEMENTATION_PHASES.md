# Implementation Phases: Cloudflare MCP Toolbox

**Project Type**: MCP Server (Utility Tools for AI Agents)
**Stack**: Cloudflare Workers + Hono + KV + Workers AI
**Estimated Total**: 12 hours (~12 minutes human time)

---

## Phase 1: Infrastructure & Base MCP Server
**Type**: Infrastructure
**Estimated**: 2 hours

**Tasks**:
- [ ] Initialize npm project with TypeScript, Hono, Wrangler
- [ ] Create wrangler.jsonc with account ID, KV namespace, Workers AI binding
- [ ] Setup project structure (src/index.ts, src/mcp/, src/handlers/, src/utils/)
- [ ] Create MCP types (JSON-RPC 2.0 protocol)
- [ ] Implement base server handler (initialize, tools/list, tools/call)
- [ ] Add Bearer auth middleware (Hono's bearerAuth)
- [ ] Create beautiful HTML discovery page at `/` (like R2 server)
- [ ] Test local dev server (`wrangler dev`)

**Files**:
- `package.json`
- `tsconfig.json`
- `wrangler.jsonc`
- `src/index.ts`
- `src/mcp/types.ts`
- `src/mcp/server.ts`
- `src/utils/responses.ts`

**Verification Criteria**:
- [ ] `wrangler dev` starts without errors
- [ ] GET `/` returns HTML discovery page
- [ ] POST `/mcp` with initialize returns protocol version
- [ ] POST `/mcp` with tools/list returns empty array (no tools yet)
- [ ] POST `/mcp` without Bearer token returns 401
- [ ] POST `/mcp` with valid token returns 200

**Exit Criteria**: Base MCP server responds to protocol messages, auth works, discovery page loads

---

## Phase 2: Date/Time Utility Tools
**Type**: API
**Estimated**: 2 hours

**Tasks**:
- [ ] Create `src/handlers/datetime.ts` with date/time utilities
- [ ] Implement `get_current_datetime` (supports timezone param, defaults to Australia/Sydney)
- [ ] Implement `convert_timezone` (convert between timezones)
- [ ] Implement `calculate_duration` (difference between two dates/times)
- [ ] Implement `format_date` (ISO, relative, custom formats)
- [ ] Implement `parse_date` (natural language: "next Tuesday", "in 3 days")
- [ ] Add tools to `src/mcp/tools.ts` registry
- [ ] Wire handlers in `src/mcp/server.ts` tools/call switch
- [ ] Test each tool via curl/Postman

**Files**:
- `src/handlers/datetime.ts`
- `src/mcp/tools.ts`
- `src/mcp/server.ts` (modify)

**Verification Criteria**:
- [ ] `get_current_datetime` returns Sydney time by default
- [ ] `convert_timezone` correctly converts UTC to Sydney (AEDT/AEST based on DST)
- [ ] `calculate_duration` returns seconds/minutes/hours/days between dates
- [ ] `format_date` supports ISO 8601, relative ("2 days ago"), custom formats
- [ ] `parse_date` handles "tomorrow", "next week", "in 3 hours"
- [ ] All tools return proper MCP response format (content array with text)
- [ ] Invalid params return MCP error with code -32602

**Exit Criteria**: All 5 date/time tools functional, tested, return correct Sydney timezone

---

## Phase 3: Math & Calculation Tools
**Type**: API
**Estimated**: 1.5 hours

**Tasks**:
- [ ] Create `src/handlers/math.ts` with calculation utilities
- [ ] Implement `calculate` (safe math expression evaluation - use Function constructor or mathjs)
- [ ] Implement `convert_units` (length, weight, temperature, volume, time)
- [ ] Implement `statistics` (mean, median, mode, std dev, percentiles from array)
- [ ] Implement `random_number` (crypto.getRandomValues for secure random in range)
- [ ] Implement `percentage` (calculate percentage, percentage change, percentage of)
- [ ] Add tools to registry and wire handlers
- [ ] Test with various expressions and edge cases

**Files**:
- `src/handlers/math.ts`
- `src/mcp/tools.ts` (modify)
- `src/mcp/server.ts` (modify)

**Verification Criteria**:
- [ ] `calculate` evaluates "2 + 2 * 3" = 8 (order of operations)
- [ ] `calculate` rejects dangerous expressions (no eval injection)
- [ ] `convert_units` handles metric/imperial (km↔miles, kg↔lbs, C↔F)
- [ ] `statistics` returns correct mean/median/mode for [1,2,2,3,4,5]
- [ ] `random_number` generates cryptographically secure random in range
- [ ] `percentage` calculates 15% of 200 = 30
- [ ] Division by zero returns error, not crash

**Exit Criteria**: All 5 math tools functional, safe from injection, handle edge cases

---

## Phase 4: Text Processing Tools
**Type**: API
**Estimated**: 2 hours

**Tasks**:
- [ ] Create `src/handlers/text.ts` with text utilities
- [ ] Implement `transform_text` (uppercase, lowercase, title case, slug, trim, reverse)
- [ ] Implement `encode_decode` (base64, URL encoding, HTML entities)
- [ ] Implement `extract_patterns` (regex: emails, URLs, phone numbers, hashtags)
- [ ] Implement `hash_text` (SHA-256, MD5 using Web Crypto API)
- [ ] Implement `count_words` (word count, character count, sentence count)
- [ ] Implement `truncate_text` (smart truncate with ellipsis, respect word boundaries)
- [ ] Add tools to registry and wire handlers
- [ ] Test with Unicode, emojis, edge cases

**Files**:
- `src/handlers/text.ts`
- `src/mcp/tools.ts` (modify)
- `src/mcp/server.ts` (modify)

**Verification Criteria**:
- [ ] `transform_text` handles Unicode correctly (café → CAFÉ)
- [ ] `transform_text` slug mode creates URL-safe slugs (Hello World! → hello-world)
- [ ] `encode_decode` base64 encodes/decodes correctly
- [ ] `extract_patterns` finds all emails in mixed text
- [ ] `extract_patterns` finds URLs with http/https/www
- [ ] `hash_text` SHA-256 returns consistent hex hash
- [ ] `count_words` counts "Hello, world!" as 2 words
- [ ] `truncate_text` respects word boundaries (doesn't cut mid-word)

**Exit Criteria**: All 6 text tools functional, handle Unicode/emojis, regex patterns work

---

## Phase 5: Data Validation Tools
**Type**: API
**Estimated**: 1.5 hours

**Tasks**:
- [ ] Create `src/handlers/validation.ts` with validation utilities
- [ ] Implement `validate_email` (RFC 5322 email validation)
- [ ] Implement `validate_url` (URL format with protocol check)
- [ ] Implement `validate_phone` (international phone formats, E.164)
- [ ] Implement `validate_json` (parse and validate JSON structure)
- [ ] Implement `sanitize_html` (strip HTML tags or escape dangerous content)
- [ ] Implement `validate_schema` (JSON Schema validation using simple checks)
- [ ] Add tools to registry and wire handlers
- [ ] Test with valid/invalid inputs

**Files**:
- `src/handlers/validation.ts`
- `src/mcp/tools.ts` (modify)
- `src/mcp/server.ts` (modify)

**Verification Criteria**:
- [ ] `validate_email` accepts user@example.com, rejects invalid@
- [ ] `validate_url` requires protocol (http/https)
- [ ] `validate_url` accepts valid domains, rejects malformed
- [ ] `validate_phone` handles +61 (Australia), +1 (US) formats
- [ ] `validate_json` returns true for valid JSON, error message for invalid
- [ ] `sanitize_html` strips `<script>` tags
- [ ] `sanitize_html` escapes `<` to `&lt;`
- [ ] `validate_schema` checks type, required fields

**Exit Criteria**: All 6 validation tools functional, handle edge cases, secure against XSS

---

## Phase 6: KV Storage Tools
**Type**: Integration
**Estimated**: 1.5 hours

**Tasks**:
- [ ] Create `src/handlers/kv.ts` with KV utilities
- [ ] Implement `kv_get` (retrieve value by key, returns null if not found)
- [ ] Implement `kv_set` (store value with optional TTL in seconds)
- [ ] Implement `kv_delete` (remove key)
- [ ] Implement `kv_list` (list keys with optional prefix filter, limit)
- [ ] Add namespace parameter to all tools (support multiple KV namespaces)
- [ ] Add tools to registry and wire handlers
- [ ] Test CRUD operations with wrangler dev

**Files**:
- `src/handlers/kv.ts`
- `src/mcp/tools.ts` (modify)
- `src/mcp/server.ts` (modify)
- `wrangler.jsonc` (add KV binding)

**Verification Criteria**:
- [ ] `kv_set` stores value and returns success
- [ ] `kv_get` retrieves stored value
- [ ] `kv_get` returns null for non-existent key (not error)
- [ ] `kv_set` with TTL expires after specified seconds
- [ ] `kv_delete` removes key
- [ ] `kv_list` returns keys matching prefix
- [ ] `kv_list` respects limit parameter
- [ ] JSON values are serialized/deserialized correctly

**Exit Criteria**: All 4 KV tools functional, TTL works, prefix filtering works

---

## Phase 7: Workers AI Tools
**Type**: Integration
**Estimated**: 1.5 hours

**Tasks**:
- [ ] Create `src/handlers/ai.ts` with Workers AI utilities
- [ ] Implement `ai_chat` (LLM inference: @cf/meta/llama-3.1-8b-instruct)
- [ ] Implement `ai_classify` (text classification/sentiment: @cf/huggingface/distilbert-sst-2-int8)
- [ ] Implement `ai_embed` (text embeddings: @cf/baai/bge-base-en-v1.5)
- [ ] Add error handling for AI failures (quota, model unavailable)
- [ ] Add optional caching for embeddings (KV cache by input hash)
- [ ] Add tools to registry and wire handlers
- [ ] Test with various prompts and edge cases

**Files**:
- `src/handlers/ai.ts`
- `src/mcp/tools.ts` (modify)
- `src/mcp/server.ts` (modify)
- `wrangler.jsonc` (add Workers AI binding)

**Verification Criteria**:
- [ ] `ai_chat` returns coherent response to simple prompt
- [ ] `ai_chat` supports system message and max_tokens parameter
- [ ] `ai_classify` returns sentiment (POSITIVE/NEGATIVE) with score
- [ ] `ai_embed` returns 768-dimensional vector for @cf/baai/bge-base-en-v1.5
- [ ] AI quota errors return graceful error message
- [ ] Embedding cache reduces duplicate AI calls (check KV)
- [ ] Long prompts are truncated/handled gracefully

**Exit Criteria**: All 3 AI tools functional, caching works, errors handled gracefully

---

## Phase 8: Deployment & Documentation
**Type**: Infrastructure
**Estimated**: 1 hour

**Tasks**:
- [ ] Generate secure AUTH_TOKEN (crypto.randomBytes(32).toString('base64url'))
- [ ] Add AUTH_TOKEN to wrangler.jsonc as environment variable
- [ ] Create KV namespace: `wrangler kv namespace create MCP_TOOLBOX_CACHE`
- [ ] Update wrangler.jsonc with KV binding ID
- [ ] Update HTML discovery page with all tool names and descriptions
- [ ] Create README.md with setup instructions and tool documentation
- [ ] Deploy to Cloudflare: `wrangler deploy`
- [ ] Test live endpoint with BetterChat configuration
- [ ] Verify all tools work in production

**Files**:
- `wrangler.jsonc` (modify - add secrets, bindings)
- `README.md` (create)
- `src/index.ts` (update discovery page HTML)

**Verification Criteria**:
- [ ] `wrangler deploy` succeeds without errors
- [ ] Production URL returns discovery page
- [ ] BetterChat can connect with Bearer token
- [ ] All 25 tools listed in tools/list response
- [ ] Random sampling of tools work (date/time, math, text, validation, KV, AI)
- [ ] Invalid auth token returns 401
- [ ] Discovery page shows correct endpoint URL and setup instructions

**Exit Criteria**: Server deployed, all tools functional in production, documented

---

## Summary

**Total Phases**: 8
**Core Tools**: ~25 utility tools across 6 categories
**Cloudflare Integrations**: KV (storage), Workers AI (inference + classification + embeddings)
**Authentication**: Bearer token (same pattern as R2 file server)
**Deployment**: Cloudflare Workers with Wrangler

**Tool Breakdown**:
- Date/Time: 5 tools
- Math: 5 tools
- Text: 6 tools
- Validation: 6 tools
- KV: 4 tools
- Workers AI: 3 tools

**Testing Strategy**: Inline verification per phase (no separate testing phase)
**Deployment Strategy**: Deploy in Phase 8 after all tools implemented

**Context Management**: Phases sized to fit in single session with verification. Each phase is independent enough to resume after context clear.
