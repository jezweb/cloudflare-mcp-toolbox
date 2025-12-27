# CLI Scripts

These scripts provide command-line access to Cloudflare MCP Toolbox functionality.
For use with Claude Code in terminal environments.

## Why CLI Scripts?

| Aspect | Remote MCP (Claude.ai) | CLI Scripts (Claude Code) |
|--------|------------------------|---------------------------|
| Context | Results flow through model context window | Results stay local, only relevant parts shared |
| File System | No access | Full read/write access |
| Batch Operations | One call at a time | Can process files of inputs |
| Caching | Stateless | Can cache results locally |
| Output | JSON to model | JSON, CSV, table, or file |
| Chaining | Model orchestrates | Scripts can pipe/chain directly |

## Prerequisites

- Node.js 18+
- Run `npm install` in this directory

## Quick Start

```bash
# Install dependencies
npm install

# Run any script
npx tsx scripts/datetime.ts now
npx tsx scripts/math.ts calc "2 + 2"
npx tsx scripts/text.ts transform "hello" --op uppercase
npx tsx scripts/validation.ts email "test@example.com"
```

---

## Available Scripts

### datetime.ts

Date/time operations, timezone conversions, and natural language parsing.

**Commands:**

| Command | Description |
|---------|-------------|
| `now` | Get current date/time |
| `convert <datetime>` | Convert between timezones |
| `duration <start> <end>` | Calculate duration between dates |
| `format <datetime>` | Format date in various styles |
| `parse <expression>` | Parse natural language date expressions |

**Examples:**

```bash
# Get current time in different formats
npx tsx scripts/datetime.ts now
npx tsx scripts/datetime.ts now --timezone "America/New_York"
npx tsx scripts/datetime.ts now --format unix

# Convert timezones
npx tsx scripts/datetime.ts convert "2024-01-15T10:00:00Z" --from UTC --to "Australia/Sydney"

# Calculate duration
npx tsx scripts/datetime.ts duration "2024-01-01" "2024-12-31" --unit days

# Format dates
npx tsx scripts/datetime.ts format "2024-01-15T10:00:00Z" --as relative
npx tsx scripts/datetime.ts format 1705312800 --as long

# Parse natural language
npx tsx scripts/datetime.ts parse "tomorrow"
npx tsx scripts/datetime.ts parse "in 3 days"
npx tsx scripts/datetime.ts parse "next friday"

# Batch processing
npx tsx scripts/datetime.ts parse --input expressions.txt --output results.json
```

---

### math.ts

Calculations, unit conversions, statistics, and random number generation.

**Commands:**

| Command | Description |
|---------|-------------|
| `calc <expression>` | Evaluate mathematical expression |
| `convert <value> <from> <to>` | Convert between units |
| `stats <numbers...>` | Calculate statistics |
| `random` | Generate random number |
| `percent <op> <v1> <v2>` | Calculate percentages |
| `dice <notation>` | Roll dice |

**Supported Units:**

- **Length:** m, km, cm, mm, miles, yards, feet, inches
- **Weight:** kg, g, mg, lbs, oz
- **Volume:** liters, ml, gallons, cups
- **Time:** seconds, minutes, hours, days, weeks
- **Temperature:** celsius, fahrenheit, kelvin

**Examples:**

```bash
# Calculate expressions
npx tsx scripts/math.ts calc "2 + 3 * 4"
npx tsx scripts/math.ts calc "(10 + 5) / 3"
npx tsx scripts/math.ts calc "2^10"

# Convert units
npx tsx scripts/math.ts convert 100 km miles
npx tsx scripts/math.ts convert 72 fahrenheit celsius
npx tsx scripts/math.ts convert 1 weeks days

# Statistics
npx tsx scripts/math.ts stats 1,2,3,4,5,6,7,8,9,10
npx tsx scripts/math.ts stats 1 2 3 4 5 --metrics mean,median

# Random numbers
npx tsx scripts/math.ts random
npx tsx scripts/math.ts random --min 1 --max 100 --integer

# Percentages
npx tsx scripts/math.ts percent of 20 100      # 20% of 100 = 20
npx tsx scripts/math.ts percent change 100 150 # 50% increase
npx tsx scripts/math.ts percent is_what_percent 25 100

# Dice rolling
npx tsx scripts/math.ts dice 2d6
npx tsx scripts/math.ts dice 1d20+5
npx tsx scripts/math.ts dice 4d6-1
```

---

### text.ts

Text transformation, encoding, pattern extraction, hashing, and analysis.

**Commands:**

| Command | Description |
|---------|-------------|
| `transform <text>` | Transform text (case, slug, etc.) |
| `encode <text>` | Encode/decode text |
| `extract <text>` | Extract patterns from text |
| `hash <text>` | Hash text |
| `count <text>` | Count words, characters, etc. |
| `truncate <text>` | Truncate text |

**Transform Operations:**

- `uppercase`, `lowercase`, `titlecase`, `slug`, `trim`, `reverse`

**Encode Operations:**

- `base64`, `url`, `html` (use `--decode` for decoding)

**Extract Patterns:**

- `emails`, `urls`, `phones`, `hashtags`, `mentions`, `custom`

**Examples:**

```bash
# Transform text
npx tsx scripts/text.ts transform "hello world" --op uppercase
npx tsx scripts/text.ts transform "My Blog Post Title" --op slug
npx tsx scripts/text.ts transform "  whitespace  " --op trim

# Encode/decode
npx tsx scripts/text.ts encode "hello" --op base64
npx tsx scripts/text.ts encode "aGVsbG8=" --op base64 --decode
npx tsx scripts/text.ts encode "hello world" --op url
npx tsx scripts/text.ts encode "<script>alert(1)</script>" --op html

# Extract patterns
npx tsx scripts/text.ts extract "Contact us at info@example.com" --pattern emails
npx tsx scripts/text.ts extract "Visit https://example.com" --pattern urls
npx tsx scripts/text.ts extract "#coding is fun #javascript" --pattern hashtags

# Hash text
npx tsx scripts/text.ts hash "password123" --algorithm sha256
npx tsx scripts/text.ts hash "data" --algorithm sha1 --format base64

# Count text metrics
npx tsx scripts/text.ts count "Hello, world. How are you?"
npx tsx scripts/text.ts count --input document.txt

# Truncate text
npx tsx scripts/text.ts truncate "This is a long text" --max 10
```

---

### validation.ts

Validate emails, URLs, phones, JSON, and data schemas.

**Commands:**

| Command | Description |
|---------|-------------|
| `email <email>` | Validate email address |
| `url <url>` | Validate and parse URL |
| `phone <phone>` | Validate phone number |
| `json <json-string>` | Validate JSON structure |
| `html <html>` | Sanitize HTML content |
| `schema <data>` | Validate data against schema |

**Examples:**

```bash
# Validate emails
npx tsx scripts/validation.ts email "user@example.com"
npx tsx scripts/validation.ts email "invalid-email"
npx tsx scripts/validation.ts email --input emails.txt

# Validate URLs
npx tsx scripts/validation.ts url "https://example.com/path?q=1"

# Validate phone numbers
npx tsx scripts/validation.ts phone "+1 555-123-4567"
npx tsx scripts/validation.ts phone "0412345678" --country AU

# Validate JSON
npx tsx scripts/validation.ts json '{"name": "test", "count": 5}'
npx tsx scripts/validation.ts json --input data.json

# Sanitize HTML
npx tsx scripts/validation.ts html "<p>Hello</p><script>alert(1)</script>" --mode strip
npx tsx scripts/validation.ts html "<div onclick='hack()'>Click</div>" --mode escape

# Validate against schema
npx tsx scripts/validation.ts schema '{"name": "test"}' --schema schema.json
```

---

### kv.ts

Cloudflare KV storage operations via REST API.

**Prerequisites:**

Set environment variables:
```bash
export CLOUDFLARE_ACCOUNT_ID=your_account_id
export CLOUDFLARE_API_TOKEN=your_api_token
export KV_NAMESPACE_ID=your_namespace_id
```

**Commands:**

| Command | Description |
|---------|-------------|
| `get <key>` | Get value by key |
| `set <key> <value>` | Set key-value pair |
| `delete <key>` | Delete key |
| `list` | List keys |

**Examples:**

```bash
# Get a value
npx tsx scripts/kv.ts get mykey
npx tsx scripts/kv.ts get config --type json

# Set values
npx tsx scripts/kv.ts set mykey "hello world"
npx tsx scripts/kv.ts set config '{"debug":true}' --ttl 3600
npx tsx scripts/kv.ts set session abc123 --ttl 86400

# Delete a key
npx tsx scripts/kv.ts delete mykey

# List keys
npx tsx scripts/kv.ts list
npx tsx scripts/kv.ts list --prefix "user:"
npx tsx scripts/kv.ts list --limit 50

# Batch operations
npx tsx scripts/kv.ts get --input keys.txt --output results.json
```

---

### ai.ts

Cloudflare Workers AI inference via REST API.

**Prerequisites:**

Set environment variables:
```bash
export CLOUDFLARE_ACCOUNT_ID=your_account_id
export CLOUDFLARE_API_TOKEN=your_api_token
```

**Commands:**

| Command | Description |
|---------|-------------|
| `chat <prompt>` | Run LLM chat completion |
| `classify <text>` | Run text classification/sentiment |
| `embed <text>` | Generate text embeddings |

**Default Models:**

- **chat:** `@cf/meta/llama-3.1-8b-instruct`
- **classify:** `@cf/huggingface/distilbert-sst-2-int8`
- **embed:** `@cf/baai/bge-base-en-v1.5`

**Examples:**

```bash
# Chat completion
npx tsx scripts/ai.ts chat "What is the capital of France?"
npx tsx scripts/ai.ts chat "Explain quantum computing" --system "You are a helpful teacher"
npx tsx scripts/ai.ts chat "Hello" --model "@cf/mistral/mistral-7b-instruct-v0.1"

# Classification/Sentiment
npx tsx scripts/ai.ts classify "This product is amazing!"
npx tsx scripts/ai.ts classify "I'm very disappointed"
npx tsx scripts/ai.ts classify --input reviews.txt

# Embeddings
npx tsx scripts/ai.ts embed "Hello world"
npx tsx scripts/ai.ts embed "Machine learning" --cache-dir ./cache
npx tsx scripts/ai.ts embed --input texts.txt --output embeddings.json

# Batch processing
npx tsx scripts/ai.ts chat --input prompts.txt --output responses.json
npx tsx scripts/ai.ts classify --input reviews.txt --format table
```

---

## Common Options

All scripts support these common options:

| Option | Description |
|--------|-------------|
| `--input <file>` | Read input from file (batch mode) |
| `--output <file>` | Write results to file instead of stdout |
| `--format <type>` | Output format: `json`, `csv`, `table` |
| `--verbose` | Show debug information |
| `--help` | Show usage information |

## Output Formats

### JSON (default)

```json
{
  "success": true,
  "data": { ... }
}
```

### CSV

```csv
field1,field2,field3
value1,value2,value3
```

### Table

```
+--------+--------+--------+
| field1 | field2 | field3 |
+--------+--------+--------+
| value1 | value2 | value3 |
+--------+--------+--------+
```

## Error Handling

Scripts exit with code 0 on success, non-zero on failure.
Errors are output as JSON:

```json
{
  "success": false,
  "error": "Error message here"
}
```

## Batch Processing

Most commands support batch processing via `--input`:

```bash
# Process multiple items from a file
npx tsx scripts/validation.ts email --input emails.txt --output results.json

# Each line in the input file is processed separately
# Results are returned as an array
```

## Piping and Chaining

Scripts output JSON by default, making them easy to chain:

```bash
# Extract emails and validate them
npx tsx scripts/text.ts extract "contact: test@example.com" --pattern emails | \
  jq -r '.matches[]' | \
  xargs -I {} npx tsx scripts/validation.ts email "{}"
```
