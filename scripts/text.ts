#!/usr/bin/env npx tsx
/**
 * Text Processing CLI
 * Tools for text transformation, encoding, pattern extraction, hashing, and analysis
 *
 * Usage:
 *   npx tsx scripts/text.ts <command> [args...]
 *   npx tsx scripts/text.ts transform <text> --op uppercase|lowercase|titlecase|slug|trim|reverse
 *   npx tsx scripts/text.ts encode <text> --op base64|url|html [--decode]
 *   npx tsx scripts/text.ts extract <text> --pattern emails|urls|phones|hashtags|mentions|custom
 *   npx tsx scripts/text.ts hash <text> --algorithm sha256|sha1|md5
 *   npx tsx scripts/text.ts count <text>
 *   npx tsx scripts/text.ts truncate <text> --max <length>
 *
 * Examples:
 *   npx tsx scripts/text.ts transform "hello world" --op uppercase
 *   npx tsx scripts/text.ts encode "hello" --op base64
 *   npx tsx scripts/text.ts extract "email me at test@example.com" --pattern emails
 *   npx tsx scripts/text.ts hash "password123" --algorithm sha256
 */

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
// Core Functions (from handlers/text.ts)
// ============================================================================

function transformText(args: {
  text: string;
  operation: 'uppercase' | 'lowercase' | 'titlecase' | 'slug' | 'trim' | 'reverse';
}): { original: string; transformed: string; operation: string } {
  const { text, operation } = args;
  let transformed: string;

  switch (operation) {
    case 'uppercase':
      transformed = text.toUpperCase();
      break;

    case 'lowercase':
      transformed = text.toLowerCase();
      break;

    case 'titlecase':
      transformed = text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
      break;

    case 'slug':
      transformed = text
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .replace(/[^\w\s-]/g, '')
        .trim()
        .replace(/\s+/g, '-')
        .replace(/-+/g, '-');
      break;

    case 'trim':
      transformed = text.trim();
      break;

    case 'reverse':
      transformed = text.split('').reverse().join('');
      break;

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return { original: text, transformed, operation };
}

function encodeDecode(args: {
  text: string;
  operation: 'base64_encode' | 'base64_decode' | 'url_encode' | 'url_decode' | 'html_escape' | 'html_unescape';
}): { original: string; result: string; operation: string } {
  const { text, operation } = args;
  let result: string;

  switch (operation) {
    case 'base64_encode':
      result = Buffer.from(text).toString('base64');
      break;

    case 'base64_decode':
      try {
        result = Buffer.from(text, 'base64').toString('utf-8');
      } catch {
        throw new Error('Invalid base64 string');
      }
      break;

    case 'url_encode':
      result = encodeURIComponent(text);
      break;

    case 'url_decode':
      try {
        result = decodeURIComponent(text);
      } catch {
        throw new Error('Invalid URL-encoded string');
      }
      break;

    case 'html_escape':
      result = text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
      break;

    case 'html_unescape':
      result = text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'");
      break;

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return { original: text, result, operation };
}

function extractPatterns(args: {
  text: string;
  pattern: 'emails' | 'urls' | 'phone_numbers' | 'hashtags' | 'mentions' | 'custom';
  custom_regex?: string;
}): { text: string; pattern: string; matches: string[]; count: number } {
  const { text, pattern, custom_regex } = args;
  let regex: RegExp;

  switch (pattern) {
    case 'emails':
      regex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g;
      break;

    case 'urls':
      regex =
        /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g;
      break;

    case 'phone_numbers':
      regex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g;
      break;

    case 'hashtags':
      regex = /#[\w]+/g;
      break;

    case 'mentions':
      regex = /@[\w]+/g;
      break;

    case 'custom':
      if (!custom_regex) {
        throw new Error('custom_regex parameter required for custom pattern');
      }
      try {
        regex = new RegExp(custom_regex, 'g');
      } catch {
        throw new Error('Invalid regular expression');
      }
      break;

    default:
      throw new Error(`Unknown pattern: ${pattern}`);
  }

  const matches = text.match(regex) || [];
  return { text, pattern, matches, count: matches.length };
}

async function hashText(args: {
  text: string;
  algorithm: 'sha256' | 'sha1' | 'md5';
  output_format?: 'hex' | 'base64';
}): Promise<{ text: string; algorithm: string; hash: string; format: string }> {
  const { text, algorithm, output_format = 'hex' } = args;

  const hash = crypto.createHash(algorithm).update(text).digest(output_format);

  return { text, algorithm, hash, format: output_format };
}

function countWords(args: {
  text: string;
  metrics?: string[];
}): Record<string, number> {
  const { text, metrics = ['words', 'characters', 'sentences', 'paragraphs', 'lines'] } = args;
  const results: Record<string, number> = {};

  if (metrics.includes('characters')) {
    results.characters = text.length;
  }

  if (metrics.includes('characters_no_spaces')) {
    results.characters_no_spaces = text.replace(/\s/g, '').length;
  }

  if (metrics.includes('words')) {
    const words = text
      .trim()
      .split(/\s+/)
      .filter(w => w.length > 0);
    results.words = words.length;
  }

  if (metrics.includes('sentences')) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    results.sentences = sentences.length;
  }

  if (metrics.includes('paragraphs')) {
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0);
    results.paragraphs = paragraphs.length;
  }

  if (metrics.includes('lines')) {
    const lines = text.split('\n');
    results.lines = lines.length;
  }

  return results;
}

function truncateText(args: {
  text: string;
  max_length: number;
  ellipsis?: boolean;
  break_words?: boolean;
}): { original_length: number; truncated: string; was_truncated: boolean } {
  const { text, max_length, ellipsis = true, break_words = false } = args;

  if (text.length <= max_length) {
    return { original_length: text.length, truncated: text, was_truncated: false };
  }

  const ellipsisStr = ellipsis ? '...' : '';
  const targetLength = max_length - ellipsisStr.length;

  let truncated: string;
  if (break_words) {
    truncated = text.substring(0, targetLength) + ellipsisStr;
  } else {
    const cut = text.substring(0, targetLength);
    const lastSpace = cut.lastIndexOf(' ');

    if (lastSpace === -1) {
      truncated = cut + ellipsisStr;
    } else {
      truncated = cut.substring(0, lastSpace) + ellipsisStr;
    }
  }

  return { original_length: text.length, truncated, was_truncated: true };
}

// ============================================================================
// CLI Commands
// ============================================================================

function showHelp(): void {
  console.log(`
Text Processing CLI
Tools for text transformation, encoding, pattern extraction, hashing, and analysis

USAGE:
  npx tsx scripts/text.ts <command> [args...] [options]

COMMANDS:
  transform <text>    Transform text (case, slug, etc.)
  encode <text>       Encode/decode text
  extract <text>      Extract patterns from text
  hash <text>         Hash text
  count <text>        Count words, characters, etc.
  truncate <text>     Truncate text

TRANSFORM OPERATIONS (--op):
  uppercase   Convert to UPPERCASE
  lowercase   Convert to lowercase
  titlecase   Convert to Title Case
  slug        Convert to url-friendly-slug
  trim        Remove leading/trailing whitespace
  reverse     Reverse the text

ENCODE OPERATIONS (--op):
  base64      Base64 encode (use --decode to decode)
  url         URL encode (use --decode to decode)
  html        HTML escape (use --decode to unescape)

EXTRACT PATTERNS (--pattern):
  emails      Email addresses
  urls        URLs (http/https)
  phones      Phone numbers
  hashtags    #hashtags
  mentions    @mentions
  custom      Custom regex (requires --regex)

HASH ALGORITHMS (--algorithm):
  sha256      SHA-256 (default)
  sha1        SHA-1
  md5         MD5

OPTIONS:
  --op <operation>     Operation for transform/encode
  --decode             Decode instead of encode
  --pattern <p>        Pattern type for extract
  --regex <r>          Custom regex for extract
  --algorithm <a>      Hash algorithm
  --format <f>         Hash output: hex or base64
  --max <n>            Max length for truncate
  --ellipsis           Add ellipsis when truncating (default: true)
  --break-words        Allow breaking words when truncating
  --input <file>       Read text from file
  --output <file>      Write results to file
  --verbose            Show debug information
  --help               Show this help

EXAMPLES:
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
  npx tsx scripts/text.ts extract "Hello world" --pattern custom --regex "\\b\\w+\\b"

  # Hash text
  npx tsx scripts/text.ts hash "password123" --algorithm sha256
  npx tsx scripts/text.ts hash "data" --algorithm sha1 --format base64

  # Count text metrics
  npx tsx scripts/text.ts count "Hello, world. How are you?"
  npx tsx scripts/text.ts count --input document.txt

  # Truncate text
  npx tsx scripts/text.ts truncate "This is a long text" --max 10
  npx tsx scripts/text.ts truncate "Breakable" --max 5 --break-words

  # Batch processing
  npx tsx scripts/text.ts transform --input texts.txt --op uppercase --output results.json
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

  // Get text from positional arg or input file
  function getText(): string {
    if (flags.input) {
      return readInputFile(flags.input);
    }
    return requireArg(positional, 1, 'text');
  }

  switch (command) {
    case 'transform': {
      const operation = raw['op'] as
        | 'uppercase'
        | 'lowercase'
        | 'titlecase'
        | 'slug'
        | 'trim'
        | 'reverse';

      if (!operation) {
        throw new Error('--op is required. Options: uppercase, lowercase, titlecase, slug, trim, reverse');
      }

      if (flags.input) {
        const lines = readInputLines(flags.input);
        const results = lines.map(text => ({ success: true, ...transformText({ text, operation }) }));
        result = { success: true, count: results.length, results };
      } else {
        const text = getText();
        result = { success: true, ...transformText({ text, operation }) };
      }
      break;
    }

    case 'encode': {
      const text = getText();
      const op = raw['op'] as string;
      const decode = !!raw['decode'];

      if (!op) {
        throw new Error('--op is required. Options: base64, url, html');
      }

      let operation:
        | 'base64_encode'
        | 'base64_decode'
        | 'url_encode'
        | 'url_decode'
        | 'html_escape'
        | 'html_unescape';

      switch (op) {
        case 'base64':
          operation = decode ? 'base64_decode' : 'base64_encode';
          break;
        case 'url':
          operation = decode ? 'url_decode' : 'url_encode';
          break;
        case 'html':
          operation = decode ? 'html_unescape' : 'html_escape';
          break;
        default:
          throw new Error(`Unknown encode operation: ${op}`);
      }

      result = { success: true, ...encodeDecode({ text, operation }) };
      break;
    }

    case 'extract': {
      const text = getText();
      const pattern = raw['pattern'] as 'emails' | 'urls' | 'phone_numbers' | 'hashtags' | 'mentions' | 'custom';
      const custom_regex = raw['regex'] as string | undefined;

      if (!pattern) {
        throw new Error('--pattern is required. Options: emails, urls, phones, hashtags, mentions, custom');
      }

      // Map short names
      const patternMap: Record<string, 'emails' | 'urls' | 'phone_numbers' | 'hashtags' | 'mentions' | 'custom'> = {
        emails: 'emails',
        urls: 'urls',
        phones: 'phone_numbers',
        phone_numbers: 'phone_numbers',
        hashtags: 'hashtags',
        mentions: 'mentions',
        custom: 'custom',
      };

      result = {
        success: true,
        ...extractPatterns({ text, pattern: patternMap[pattern] || pattern, custom_regex }),
      };
      break;
    }

    case 'hash': {
      const text = getText();
      const algorithm = (raw['algorithm'] as 'sha256' | 'sha1' | 'md5') || 'sha256';
      const output_format = (raw['format'] as 'hex' | 'base64') || 'hex';

      result = { success: true, ...(await hashText({ text, algorithm, output_format })) };
      break;
    }

    case 'count': {
      const text = getText();
      const metrics = raw['metrics'] ? (raw['metrics'] as string).split(',') : undefined;
      const counts = countWords({ text, metrics });
      result = { success: true, ...counts };
      break;
    }

    case 'truncate': {
      const text = getText();
      const max_length = parseInt(raw['max'] as string);

      if (isNaN(max_length) || max_length <= 0) {
        throw new Error('--max is required and must be a positive number');
      }

      const ellipsis = raw['ellipsis'] !== 'false' && raw['ellipsis'] !== false;
      const break_words = !!raw['break-words'];

      result = { success: true, ...truncateText({ text, max_length, ellipsis, break_words }) };
      break;
    }

    default:
      throw new Error(`Unknown command: ${command}. Use --help for usage.`);
  }

  const output = formatOutput(result, flags.format);
  writeOutput(output, flags.output, flags.verbose);
}

runMain(main);
