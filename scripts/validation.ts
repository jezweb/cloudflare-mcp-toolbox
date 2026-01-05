#!/usr/bin/env npx tsx
/**
 * Validation Utilities CLI
 * Tools for validating emails, URLs, phones, JSON, and data schemas
 *
 * Usage:
 *   npx tsx scripts/validation.ts <command> [args...]
 *   npx tsx scripts/validation.ts email <email>
 *   npx tsx scripts/validation.ts url <url>
 *   npx tsx scripts/validation.ts phone <phone>
 *   npx tsx scripts/validation.ts json <json-string>
 *   npx tsx scripts/validation.ts html <html> --mode strip|escape
 *   npx tsx scripts/validation.ts schema <data> --schema <schema-file>
 *
 * Examples:
 *   npx tsx scripts/validation.ts email "test@example.com"
 *   npx tsx scripts/validation.ts url "https://example.com/path?query=1"
 *   npx tsx scripts/validation.ts phone "+1 555-123-4567"
 *   npx tsx scripts/validation.ts json '{"name": "test"}'
 *   npx tsx scripts/validation.ts html "<script>alert(1)</script>" --mode strip
 */

import {
  parseBaseArgs,
  formatOutput,
  writeOutput,
  handleError,
  runMain,
  requireArg,
  readInputFile,
  readInputLines,
  readInputJson,
} from './_shared.js';

// ============================================================================
// Core Functions (from handlers/validation.ts)
// ============================================================================

function validateEmail(email: string): { valid: boolean; email?: string; error?: string } {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  if (!email || !emailRegex.test(email)) {
    return { valid: false, error: 'Invalid email format' };
  }

  return { valid: true, email };
}

function validateUrl(args: {
  url: string;
  require_protocol?: boolean;
}): {
  valid: boolean;
  protocol?: string;
  domain?: string;
  path?: string;
  query?: string;
  error?: string;
} {
  const { url, require_protocol = true } = args;

  try {
    const parsed = new URL(url);

    if (require_protocol && !['http:', 'https:'].includes(parsed.protocol)) {
      return { valid: false, error: 'URL must use http or https protocol' };
    }

    return {
      valid: true,
      protocol: parsed.protocol.replace(':', ''),
      domain: parsed.hostname,
      path: parsed.pathname,
      query: parsed.search.replace('?', ''),
    };
  } catch {
    return { valid: false, error: 'Invalid URL format' };
  }
}

function validatePhone(args: {
  phone: string;
  country_code?: string;
}): { valid: boolean; formatted?: string; country_code?: string; error?: string } {
  const { phone, country_code } = args;
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '');

  const phoneRegex = /^\+?\d{10,15}$/;

  if (!phoneRegex.test(cleaned)) {
    return { valid: false, error: 'Invalid phone number format' };
  }

  const formatted = cleaned.startsWith('+')
    ? `+${cleaned.slice(1, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`
    : cleaned;

  const result: { valid: boolean; formatted: string; country_code?: string } = {
    valid: true,
    formatted: formatted.trim(),
  };

  if (country_code) {
    result.country_code = country_code.toUpperCase();
  }

  return result;
}

function validateJson(json_string: string): { valid: boolean; parsed?: unknown; error?: string } {
  try {
    const parsed = JSON.parse(json_string);
    return { valid: true, parsed };
  } catch (error) {
    return {
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid JSON',
    };
  }
}

function sanitizeHtml(args: { html: string; mode: 'strip' | 'escape' }): { original: string; sanitized: string; mode: string } {
  const { html, mode } = args;
  let sanitized: string;

  if (mode === 'strip') {
    sanitized = html.replace(/<[^>]*>/g, '');
  } else if (mode === 'escape') {
    sanitized = html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  } else {
    throw new Error(`Unknown mode: ${mode}`);
  }

  return { original: html, sanitized, mode };
}

function validateSchema(args: {
  data: unknown;
  schema: {
    type: string;
    required?: string[];
    properties?: Record<string, { type?: string; minimum?: number }>;
  };
}): { valid: boolean; errors?: string[] } {
  const { data, schema } = args;
  const errors: string[] = [];

  const dataType = Array.isArray(data) ? 'array' : typeof data;
  if (schema.type && dataType !== schema.type) {
    errors.push(`Expected type '${schema.type}', got '${dataType}'`);
  }

  if (schema.type === 'object' && schema.required && typeof data === 'object' && data !== null) {
    for (const field of schema.required) {
      if (!(field in (data as Record<string, unknown>))) {
        errors.push(`Missing required field: ${field}`);
      }
    }
  }

  if (schema.type === 'object' && schema.properties && typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (key in obj) {
        const propType = Array.isArray(obj[key]) ? 'array' : typeof obj[key];
        if (propSchema.type && propType !== propSchema.type) {
          errors.push(`Field '${key}' must be type '${propSchema.type}'`);
        }

        if (propSchema.type === 'number' && propSchema.minimum !== undefined) {
          if ((obj[key] as number) < propSchema.minimum) {
            errors.push(`Field '${key}' must be >= ${propSchema.minimum}`);
          }
        }
      }
    }
  }

  if (errors.length > 0) {
    return { valid: false, errors };
  }

  return { valid: true };
}

// ============================================================================
// CLI Commands
// ============================================================================

function showHelp(): void {
  console.log(`
Validation Utilities CLI
Tools for validating emails, URLs, phones, JSON, and data schemas

USAGE:
  npx tsx scripts/validation.ts <command> [args...] [options]

COMMANDS:
  email <email>        Validate email address
  url <url>            Validate and parse URL
  phone <phone>        Validate phone number
  json <json-string>   Validate JSON structure
  html <html>          Sanitize HTML content
  schema <data>        Validate data against schema

OPTIONS:
  --require-protocol   Require http/https for URLs (default: true)
  --country <code>     Country code for phone validation
  --mode <m>           HTML sanitize mode: strip or escape
  --schema <file>      JSON schema file for validation
  --input <file>       Read input from file (batch mode)
  --output <file>      Write results to file
  --format <fmt>       Output format: json, csv, table
  --verbose            Show debug information
  --help               Show this help

EXAMPLES:
  # Validate emails
  npx tsx scripts/validation.ts email "user@example.com"
  npx tsx scripts/validation.ts email "invalid-email"
  npx tsx scripts/validation.ts email --input emails.txt

  # Validate URLs
  npx tsx scripts/validation.ts url "https://example.com/path?q=1"
  npx tsx scripts/validation.ts url "ftp://files.example.com" --no-require-protocol

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

  # Batch validation
  npx tsx scripts/validation.ts email --input emails.txt --output results.json
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
  let result: unknown;

  switch (command) {
    case 'email': {
      if (flags.input) {
        const emails = readInputLines(flags.input);
        const results = emails.map(email => ({
          email,
          ...validateEmail(email),
        }));
        const validCount = results.filter(r => r.valid).length;
        result = {
          success: true,
          total: results.length,
          valid: validCount,
          invalid: results.length - validCount,
          results,
        };
      } else {
        const email = requireArg(positional, 1, 'email');
        result = { success: true, ...validateEmail(email) };
      }
      break;
    }

    case 'url': {
      if (flags.input) {
        const urls = readInputLines(flags.input);
        const require_protocol = raw['require-protocol'] !== 'false' && raw['no-require-protocol'] !== true;
        const results = urls.map(url => ({
          url,
          ...validateUrl({ url, require_protocol }),
        }));
        const validCount = results.filter(r => r.valid).length;
        result = {
          success: true,
          total: results.length,
          valid: validCount,
          invalid: results.length - validCount,
          results,
        };
      } else {
        const url = requireArg(positional, 1, 'url');
        const require_protocol = raw['require-protocol'] !== 'false' && raw['no-require-protocol'] !== true;
        result = { success: true, ...validateUrl({ url, require_protocol }) };
      }
      break;
    }

    case 'phone': {
      if (flags.input) {
        const phones = readInputLines(flags.input);
        const country_code = raw['country'] as string | undefined;
        const results = phones.map(phone => ({
          phone,
          ...validatePhone({ phone, country_code }),
        }));
        const validCount = results.filter(r => r.valid).length;
        result = {
          success: true,
          total: results.length,
          valid: validCount,
          invalid: results.length - validCount,
          results,
        };
      } else {
        const phone = requireArg(positional, 1, 'phone');
        const country_code = raw['country'] as string | undefined;
        result = { success: true, ...validatePhone({ phone, country_code }) };
      }
      break;
    }

    case 'json': {
      let json_string: string;

      if (flags.input) {
        json_string = readInputFile(flags.input);
      } else {
        json_string = requireArg(positional, 1, 'json string');
      }

      result = { success: true, ...validateJson(json_string) };
      break;
    }

    case 'html': {
      const html = flags.input ? readInputFile(flags.input) : requireArg(positional, 1, 'html');
      const mode = (raw['mode'] as 'strip' | 'escape') || 'escape';

      result = { success: true, ...sanitizeHtml({ html, mode }) };
      break;
    }

    case 'schema': {
      let data: unknown;
      let schema: {
        type: string;
        required?: string[];
        properties?: Record<string, { type?: string; minimum?: number }>;
      };

      // Get data
      if (flags.input) {
        data = readInputJson(flags.input);
      } else {
        const dataStr = requireArg(positional, 1, 'data');
        data = JSON.parse(dataStr);
      }

      // Get schema
      const schemaFile = raw['schema'] as string;
      if (!schemaFile) {
        throw new Error('--schema is required');
      }
      schema = readInputJson(schemaFile);

      result = { success: true, ...validateSchema({ data, schema }) };
      break;
    }

    default:
      throw new Error(`Unknown command: ${command}. Use --help for usage.`);
  }

  const output = formatOutput(result, flags.format);
  writeOutput(output, flags.output, flags.verbose);
}

runMain(main);
