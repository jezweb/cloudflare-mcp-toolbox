#!/usr/bin/env npx tsx
/**
 * Cloudflare Workers AI CLI
 * Tools for AI inference via Cloudflare Workers AI REST API
 *
 * Requires environment variables:
 *   CLOUDFLARE_ACCOUNT_ID - Your Cloudflare account ID
 *   CLOUDFLARE_API_TOKEN  - API token with Workers AI permissions
 *
 * Usage:
 *   npx tsx scripts/ai.ts <command> [args...]
 *   npx tsx scripts/ai.ts chat <prompt> [--system "system message"]
 *   npx tsx scripts/ai.ts classify <text>
 *   npx tsx scripts/ai.ts embed <text>
 *
 * Examples:
 *   npx tsx scripts/ai.ts chat "What is the capital of France?"
 *   npx tsx scripts/ai.ts classify "This product is amazing!"
 *   npx tsx scripts/ai.ts embed "Hello world"
 */

import * as fs from 'fs';
import * as crypto from 'crypto';
import {
  parseBaseArgs,
  formatOutput,
  writeOutput,
  handleError,
  runMain,
  requireArg,
  readInputFile,
  readInputLines,
} from './_shared.js';

// ============================================================================
// Configuration
// ============================================================================

interface AIConfig {
  accountId: string;
  apiToken: string;
  cacheDir?: string;
}

const DEFAULT_MODELS = {
  chat: '@cf/meta/llama-3.1-8b-instruct',
  classify: '@cf/huggingface/distilbert-sst-2-int8',
  embed: '@cf/baai/bge-base-en-v1.5',
};

function loadConfig(raw: Record<string, string | boolean>): AIConfig {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const cacheDir = (raw['cache-dir'] as string) || process.env.AI_CACHE_DIR;

  if (!accountId) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID environment variable is required');
  }
  if (!apiToken) {
    throw new Error('CLOUDFLARE_API_TOKEN environment variable is required');
  }

  return { accountId, apiToken, cacheDir };
}

// ============================================================================
// Cloudflare Workers AI API
// ============================================================================

async function aiApiRequest(
  config: AIConfig,
  model: string,
  body: unknown
): Promise<unknown> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/ai/run/${model}`;

  const response = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${config.apiToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Workers AI API error (${response.status}): ${error}`);
  }

  const data = (await response.json()) as { result: unknown; success: boolean; errors?: unknown[] };

  if (!data.success) {
    throw new Error(`Workers AI error: ${JSON.stringify(data.errors)}`);
  }

  return data.result;
}

async function aiChat(
  config: AIConfig,
  prompt: string,
  options: {
    system_message?: string;
    max_tokens?: number;
    model?: string;
  } = {}
): Promise<{ response: string; model: string; tokens_used: number | null }> {
  const model = options.model || DEFAULT_MODELS.chat;
  const max_tokens = options.max_tokens || 256;

  const messages: Array<{ role: string; content: string }> = [];

  if (options.system_message) {
    messages.push({ role: 'system', content: options.system_message });
  }

  messages.push({ role: 'user', content: prompt });

  const result = (await aiApiRequest(config, model, {
    messages,
    max_tokens,
  })) as { response?: string; usage?: { total_tokens?: number } };

  return {
    response: result.response || 'No response',
    model,
    tokens_used: result.usage?.total_tokens || null,
  };
}

async function aiClassify(
  config: AIConfig,
  text: string,
  model?: string
): Promise<{ classification: string; score: number; model: string }> {
  const modelToUse = model || DEFAULT_MODELS.classify;

  const result = (await aiApiRequest(config, modelToUse, { text })) as
    | Array<{ label?: string; score?: number }>
    | { label?: string; classification?: string; score?: number };

  const item = Array.isArray(result) ? result[0] : result;

  return {
    classification: item.label || (item as { classification?: string }).classification || 'unknown',
    score: item.score || 0,
    model: modelToUse,
  };
}

async function aiEmbed(
  config: AIConfig,
  text: string,
  options: {
    model?: string;
    cache?: boolean;
  } = {}
): Promise<{
  embedding: number[];
  dimensions: number;
  model: string;
  cached?: boolean;
}> {
  const model = options.model || DEFAULT_MODELS.embed;
  const useCache = options.cache !== false && config.cacheDir;

  // Generate cache key
  const hash = crypto.createHash('sha256').update(text + model).digest('hex');
  const cacheFile = config.cacheDir ? `${config.cacheDir}/embed_${hash}.json` : null;

  // Check cache
  if (useCache && cacheFile && fs.existsSync(cacheFile)) {
    const cached = JSON.parse(fs.readFileSync(cacheFile, 'utf-8'));
    return { ...cached, cached: true };
  }

  const result = (await aiApiRequest(config, model, { text })) as {
    data?: number[] | number[][];
    embedding?: number[];
  };

  const embedding = result.data || result.embedding || [];
  const flatEmbedding = Array.isArray(embedding[0]) ? (embedding as number[][])[0] : (embedding as number[]);

  const embedResult = {
    embedding: flatEmbedding,
    dimensions: flatEmbedding.length,
    model,
  };

  // Cache result
  if (useCache && cacheFile && config.cacheDir) {
    if (!fs.existsSync(config.cacheDir)) {
      fs.mkdirSync(config.cacheDir, { recursive: true });
    }
    fs.writeFileSync(cacheFile, JSON.stringify(embedResult));
  }

  return embedResult;
}

// ============================================================================
// CLI Commands
// ============================================================================

function showHelp(): void {
  console.log(`
Cloudflare Workers AI CLI
Tools for AI inference via Cloudflare Workers AI REST API

PREREQUISITES:
  Set the following environment variables:
  - CLOUDFLARE_ACCOUNT_ID: Your Cloudflare account ID
  - CLOUDFLARE_API_TOKEN: API token with Workers AI permissions

USAGE:
  npx tsx scripts/ai.ts <command> [args...] [options]

COMMANDS:
  chat <prompt>      Run LLM chat completion
  classify <text>    Run text classification/sentiment analysis
  embed <text>       Generate text embeddings

DEFAULT MODELS:
  chat:     @cf/meta/llama-3.1-8b-instruct
  classify: @cf/huggingface/distilbert-sst-2-int8
  embed:    @cf/baai/bge-base-en-v1.5

OPTIONS:
  --model <m>         Override default model
  --system <msg>      System message for chat
  --max-tokens <n>    Max tokens for chat (default: 256)
  --cache-dir <dir>   Cache directory for embeddings
  --no-cache          Disable embedding cache
  --input <file>      Read prompts from file (batch mode)
  --output <file>     Write results to file
  --format <fmt>      Output format: json, csv, table
  --verbose           Show debug information
  --help              Show this help

EXAMPLES:
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

AVAILABLE MODELS:
  Chat:
    @cf/meta/llama-3.1-8b-instruct (default)
    @cf/meta/llama-2-7b-chat-int8
    @cf/mistral/mistral-7b-instruct-v0.1
    @cf/thebloke/codellama-7b-instruct-awq

  Classification:
    @cf/huggingface/distilbert-sst-2-int8 (default)

  Embeddings:
    @cf/baai/bge-base-en-v1.5 (default)
    @cf/baai/bge-large-en-v1.5
    @cf/baai/bge-small-en-v1.5

ENVIRONMENT:
  You can also create a .env file:

  CLOUDFLARE_ACCOUNT_ID=your_account_id
  CLOUDFLARE_API_TOKEN=your_api_token
  AI_CACHE_DIR=./cache  # Optional: cache directory for embeddings
`);
}

// ============================================================================
// Main
// ============================================================================

async function main(): Promise<void> {
  const { positional, flags, raw } = parseBaseArgs(process.argv);

  if (flags.help || positional.length === 0) {
    showHelp();
    process.exit(flags.help ? 0 : 1);
  }

  const command = positional[0];
  const config = loadConfig(raw);
  let result: unknown;

  switch (command) {
    case 'chat': {
      const system_message = raw['system'] as string | undefined;
      const max_tokens = raw['max-tokens'] ? parseInt(raw['max-tokens'] as string) : undefined;
      const model = raw['model'] as string | undefined;

      if (flags.input) {
        const prompts = readInputLines(flags.input);
        const results = [];

        for (const prompt of prompts) {
          try {
            const response = await aiChat(config, prompt, { system_message, max_tokens, model });
            results.push({ success: true, prompt, ...response });
          } catch (error) {
            results.push({
              success: false,
              prompt,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }

        result = { success: true, count: results.length, results };
      } else {
        const prompt = requireArg(positional, 1, 'prompt');
        result = { success: true, ...await aiChat(config, prompt, { system_message, max_tokens, model }) };
      }
      break;
    }

    case 'classify':
    case 'sentiment': {
      const model = raw['model'] as string | undefined;

      if (flags.input) {
        const texts = readInputLines(flags.input);
        const results = [];

        for (const text of texts) {
          try {
            const response = await aiClassify(config, text, model);
            results.push({ success: true, text, ...response });
          } catch (error) {
            results.push({
              success: false,
              text,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }

        result = { success: true, count: results.length, results };
      } else {
        const text = requireArg(positional, 1, 'text');
        result = { success: true, text, ...await aiClassify(config, text, model) };
      }
      break;
    }

    case 'embed':
    case 'embedding': {
      const model = raw['model'] as string | undefined;
      const cache = raw['no-cache'] !== true;

      if (flags.input) {
        const texts = readInputLines(flags.input);
        const results = [];

        for (const text of texts) {
          try {
            const response = await aiEmbed(config, text, { model, cache });
            results.push({ success: true, text, ...response });
          } catch (error) {
            results.push({
              success: false,
              text,
              error: error instanceof Error ? error.message : String(error),
            });
          }
        }

        result = { success: true, count: results.length, results };
      } else {
        const text = requireArg(positional, 1, 'text');
        result = { success: true, text, ...await aiEmbed(config, text, { model, cache }) };
      }
      break;
    }

    default:
      throw new Error(`Unknown command: ${command}. Use --help for usage.`);
  }

  const output = formatOutput(result, flags.format);
  writeOutput(output, flags.output, flags.verbose);
}

runMain(main);
