#!/usr/bin/env npx tsx
/**
 * Cloudflare KV Storage CLI
 * Tools for interacting with Cloudflare KV storage via REST API
 *
 * Requires environment variables:
 *   CLOUDFLARE_ACCOUNT_ID - Your Cloudflare account ID
 *   CLOUDFLARE_API_TOKEN  - API token with KV permissions
 *   KV_NAMESPACE_ID       - KV namespace ID (or use --namespace flag)
 *
 * Usage:
 *   npx tsx scripts/kv.ts <command> [args...]
 *   npx tsx scripts/kv.ts get <key>
 *   npx tsx scripts/kv.ts set <key> <value> [--ttl seconds]
 *   npx tsx scripts/kv.ts delete <key>
 *   npx tsx scripts/kv.ts list [--prefix prefix] [--limit n]
 *
 * Examples:
 *   npx tsx scripts/kv.ts get mykey
 *   npx tsx scripts/kv.ts set mykey "hello world"
 *   npx tsx scripts/kv.ts set config '{"debug":true}' --ttl 3600
 *   npx tsx scripts/kv.ts list --prefix "user:"
 */

import * as fs from 'fs';
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

interface KVConfig {
  accountId: string;
  apiToken: string;
  namespaceId: string;
}

function loadConfig(raw: Record<string, string | boolean>): KVConfig {
  const accountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const apiToken = process.env.CLOUDFLARE_API_TOKEN;
  const namespaceId = (raw['namespace'] as string) || process.env.KV_NAMESPACE_ID;

  if (!accountId) {
    throw new Error('CLOUDFLARE_ACCOUNT_ID environment variable is required');
  }
  if (!apiToken) {
    throw new Error('CLOUDFLARE_API_TOKEN environment variable is required');
  }
  if (!namespaceId) {
    throw new Error('KV_NAMESPACE_ID environment variable or --namespace flag is required');
  }

  return { accountId, apiToken, namespaceId };
}

// ============================================================================
// Cloudflare KV API
// ============================================================================

async function kvApiRequest(
  config: KVConfig,
  method: string,
  path: string,
  body?: unknown,
  isText?: boolean
): Promise<unknown> {
  const url = `https://api.cloudflare.com/client/v4/accounts/${config.accountId}/storage/kv/namespaces/${config.namespaceId}${path}`;

  const headers: Record<string, string> = {
    Authorization: `Bearer ${config.apiToken}`,
  };

  if (body && !isText) {
    headers['Content-Type'] = 'application/json';
  }

  const response = await fetch(url, {
    method,
    headers,
    body: body ? (isText ? String(body) : JSON.stringify(body)) : undefined,
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`KV API error (${response.status}): ${error}`);
  }

  // For GET value requests, return text directly
  if (path.startsWith('/values/') && method === 'GET') {
    return response.text();
  }

  const data = await response.json();
  return data;
}

async function kvGet(
  config: KVConfig,
  key: string,
  type: 'text' | 'json' = 'text'
): Promise<{ found: boolean; key: string; value: unknown }> {
  try {
    const value = await kvApiRequest(config, 'GET', `/values/${encodeURIComponent(key)}`);

    let parsedValue = value;
    if (type === 'json' && typeof value === 'string') {
      try {
        parsedValue = JSON.parse(value);
      } catch {
        // Keep as string if not valid JSON
      }
    }

    return { found: true, key, value: parsedValue };
  } catch (error: unknown) {
    if (error instanceof Error && error.message.includes('404')) {
      return { found: false, key, value: null };
    }
    throw error;
  }
}

async function kvSet(
  config: KVConfig,
  key: string,
  value: unknown,
  ttl?: number
): Promise<{ success: boolean; key: string; expires_at?: number }> {
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value);

  let path = `/values/${encodeURIComponent(key)}`;
  if (ttl) {
    path += `?expiration_ttl=${ttl}`;
  }

  await kvApiRequest(config, 'PUT', path, stringValue, true);

  const result: { success: boolean; key: string; expires_at?: number } = {
    success: true,
    key,
  };

  if (ttl) {
    result.expires_at = Math.floor(Date.now() / 1000) + ttl;
  }

  return result;
}

async function kvDelete(
  config: KVConfig,
  key: string
): Promise<{ success: boolean; deleted: string }> {
  await kvApiRequest(config, 'DELETE', `/values/${encodeURIComponent(key)}`);

  return { success: true, deleted: key };
}

async function kvList(
  config: KVConfig,
  prefix?: string,
  limit: number = 100,
  cursor?: string
): Promise<{ keys: Array<{ name: string; expiration?: number }>; count: number; cursor: string | null }> {
  const params = new URLSearchParams();
  if (prefix) params.set('prefix', prefix);
  if (limit) params.set('limit', String(limit));
  if (cursor) params.set('cursor', cursor);

  const queryString = params.toString();
  const path = queryString ? `/keys?${queryString}` : '/keys';

  const response = (await kvApiRequest(config, 'GET', path)) as {
    result: Array<{ name: string; expiration?: number }>;
    result_info?: { cursor?: string };
  };

  return {
    keys: response.result || [],
    count: response.result?.length || 0,
    cursor: response.result_info?.cursor || null,
  };
}

// ============================================================================
// CLI Commands
// ============================================================================

function showHelp(): void {
  console.log(`
Cloudflare KV Storage CLI
Tools for interacting with Cloudflare KV storage via REST API

PREREQUISITES:
  Set the following environment variables:
  - CLOUDFLARE_ACCOUNT_ID: Your Cloudflare account ID
  - CLOUDFLARE_API_TOKEN: API token with KV read/write permissions
  - KV_NAMESPACE_ID: KV namespace ID (or use --namespace flag)

USAGE:
  npx tsx scripts/kv.ts <command> [args...] [options]

COMMANDS:
  get <key>              Get value by key
  set <key> <value>      Set key-value pair
  delete <key>           Delete key
  list                   List keys

OPTIONS:
  --namespace <id>   KV namespace ID (overrides env var)
  --type <t>         Value type: text or json (for get)
  --ttl <seconds>    Time-to-live for set operation
  --prefix <p>       Prefix filter for list
  --limit <n>        Max keys to return (default: 100)
  --cursor <c>       Pagination cursor for list
  --input <file>     Read keys/values from file (batch mode)
  --output <file>    Write results to file
  --format <fmt>     Output format: json, csv, table
  --verbose          Show debug information
  --help             Show this help

EXAMPLES:
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

ENVIRONMENT:
  You can also create a .env file:

  CLOUDFLARE_ACCOUNT_ID=your_account_id
  CLOUDFLARE_API_TOKEN=your_api_token
  KV_NAMESPACE_ID=your_namespace_id
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
    case 'get': {
      const type = (raw['type'] as 'text' | 'json') || 'text';

      if (flags.input) {
        const keys = readInputLines(flags.input);
        const results = await Promise.all(
          keys.map(async key => {
            try {
              return { success: true, ...await kvGet(config, key, type) };
            } catch (error) {
              return {
                success: false,
                key,
                error: error instanceof Error ? error.message : String(error),
              };
            }
          })
        );
        result = { success: true, count: results.length, results };
      } else {
        const key = requireArg(positional, 1, 'key');
        result = { success: true, ...await kvGet(config, key, type) };
      }
      break;
    }

    case 'set': {
      const key = requireArg(positional, 1, 'key');
      const ttl = raw['ttl'] ? parseInt(raw['ttl'] as string) : undefined;

      let value: unknown;
      if (flags.input) {
        value = readInputFile(flags.input);
      } else {
        value = requireArg(positional, 2, 'value');
      }

      // Try to parse as JSON if it looks like JSON
      if (typeof value === 'string' && (value.startsWith('{') || value.startsWith('['))) {
        try {
          value = JSON.parse(value);
        } catch {
          // Keep as string
        }
      }

      result = { success: true, ...await kvSet(config, key, value, ttl) };
      break;
    }

    case 'delete':
    case 'del':
    case 'rm': {
      if (flags.input) {
        const keys = readInputLines(flags.input);
        const results = await Promise.all(
          keys.map(async key => {
            try {
              return { success: true, ...await kvDelete(config, key) };
            } catch (error) {
              return {
                success: false,
                key,
                error: error instanceof Error ? error.message : String(error),
              };
            }
          })
        );
        result = { success: true, deleted: results.filter(r => r.success).length, results };
      } else {
        const key = requireArg(positional, 1, 'key');
        result = { success: true, ...await kvDelete(config, key) };
      }
      break;
    }

    case 'list':
    case 'ls': {
      const prefix = raw['prefix'] as string | undefined;
      const limit = raw['limit'] ? parseInt(raw['limit'] as string) : 100;
      const cursor = raw['cursor'] as string | undefined;

      result = { success: true, ...await kvList(config, prefix, limit, cursor) };
      break;
    }

    default:
      throw new Error(`Unknown command: ${command}. Use --help for usage.`);
  }

  const output = formatOutput(result, flags.format);
  writeOutput(output, flags.output, flags.verbose);
}

runMain(main);
