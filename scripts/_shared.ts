#!/usr/bin/env npx tsx
/**
 * Shared utilities for CLI scripts
 * Common argument parsing, output formatting, and helpers
 */

import * as fs from 'fs';
import * as path from 'path';

// ============================================================================
// Types
// ============================================================================

export interface BaseArgs {
  input?: string;
  output?: string;
  format: 'json' | 'csv' | 'table';
  verbose: boolean;
  help: boolean;
}

export interface Result<T = unknown> {
  success: boolean;
  data?: T;
  error?: string;
}

// ============================================================================
// Argument Parsing Helpers
// ============================================================================

/**
 * Parse common arguments from process.argv
 * Returns positional args and flags
 */
export function parseBaseArgs(argv: string[]): {
  positional: string[];
  flags: BaseArgs;
  raw: Record<string, string | boolean>;
} {
  const args = argv.slice(2);
  const positional: string[] = [];
  const flags: BaseArgs = {
    format: 'json',
    verbose: false,
    help: false,
  };
  const raw: Record<string, string | boolean> = {};

  for (let i = 0; i < args.length; i++) {
    const arg = args[i];

    if (arg === '--help' || arg === '-h') {
      flags.help = true;
    } else if (arg === '--verbose' || arg === '-v') {
      flags.verbose = true;
      raw['verbose'] = true;
    } else if (arg === '--input') {
      flags.input = args[++i];
      raw['input'] = flags.input;
    } else if (arg === '--output') {
      flags.output = args[++i];
      raw['output'] = flags.output;
    } else if (arg === '--format') {
      flags.format = args[++i] as BaseArgs['format'];
      raw['format'] = flags.format;
    } else if (arg.startsWith('--')) {
      // Generic flag handling
      const key = arg.slice(2);
      const nextArg = args[i + 1];
      if (nextArg && !nextArg.startsWith('-')) {
        raw[key] = args[++i];
      } else {
        raw[key] = true;
      }
    } else if (!arg.startsWith('-')) {
      positional.push(arg);
    }
  }

  return { positional, flags, raw };
}

/**
 * Read input from file if --input specified
 */
export function readInputFile(filepath: string): string {
  if (!fs.existsSync(filepath)) {
    throw new Error(`Input file not found: ${filepath}`);
  }
  return fs.readFileSync(filepath, 'utf-8');
}

/**
 * Read input as lines (for batch processing)
 */
export function readInputLines(filepath: string): string[] {
  const content = readInputFile(filepath);
  return content.split('\n').map(l => l.trim()).filter(Boolean);
}

/**
 * Read input as JSON
 */
export function readInputJson<T = unknown>(filepath: string): T {
  const content = readInputFile(filepath);
  return JSON.parse(content);
}

// ============================================================================
// Output Formatting
// ============================================================================

/**
 * Format result for output
 */
export function formatOutput(
  result: Result | unknown,
  format: 'json' | 'csv' | 'table'
): string {
  switch (format) {
    case 'json':
      return JSON.stringify(result, null, 2);

    case 'csv':
      return formatCsv(result);

    case 'table':
      return formatTable(result);

    default:
      return JSON.stringify(result, null, 2);
  }
}

/**
 * Format as CSV
 */
function formatCsv(data: unknown): string {
  if (Array.isArray(data)) {
    if (data.length === 0) return '';

    // Get headers from first object
    const headers = Object.keys(data[0] as object);
    const rows = [
      headers.join(','),
      ...data.map(row =>
        headers.map(h => {
          const val = (row as Record<string, unknown>)[h];
          const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
          return str.includes(',') ? `"${str}"` : str;
        }).join(',')
      )
    ];
    return rows.join('\n');
  }

  // Single object
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    const headers = Object.keys(obj);
    const values = headers.map(h => {
      const val = obj[h];
      const str = typeof val === 'object' ? JSON.stringify(val) : String(val ?? '');
      return str.includes(',') ? `"${str}"` : str;
    });
    return [headers.join(','), values.join(',')].join('\n');
  }

  return String(data);
}

/**
 * Format as table
 */
function formatTable(data: unknown): string {
  if (Array.isArray(data)) {
    if (data.length === 0) return '(empty)';

    const headers = Object.keys(data[0] as object);
    const widths = headers.map(h =>
      Math.max(h.length, ...data.map(row => {
        const val = (row as Record<string, unknown>)[h];
        return String(val ?? '').length;
      }))
    );

    const separator = '+' + widths.map(w => '-'.repeat(w + 2)).join('+') + '+';
    const headerRow = '| ' + headers.map((h, i) => h.padEnd(widths[i])).join(' | ') + ' |';
    const rows = data.map(row =>
      '| ' + headers.map((h, i) => {
        const val = (row as Record<string, unknown>)[h];
        return String(val ?? '').padEnd(widths[i]);
      }).join(' | ') + ' |'
    );

    return [separator, headerRow, separator, ...rows, separator].join('\n');
  }

  // Single object
  if (typeof data === 'object' && data !== null) {
    const obj = data as Record<string, unknown>;
    const entries = Object.entries(obj);
    const keyWidth = Math.max(...entries.map(([k]) => k.length));

    return entries
      .map(([k, v]) => `${k.padEnd(keyWidth)} : ${typeof v === 'object' ? JSON.stringify(v) : v}`)
      .join('\n');
  }

  return String(data);
}

/**
 * Write output to file or stdout
 */
export function writeOutput(
  content: string,
  outputPath?: string,
  verbose?: boolean
): void {
  if (outputPath) {
    fs.writeFileSync(outputPath, content);
    if (verbose) {
      console.error(`Written to ${outputPath}`);
    }
  } else {
    console.log(content);
  }
}

// ============================================================================
// Error Handling
// ============================================================================

/**
 * Handle errors consistently
 */
export function handleError(error: unknown): never {
  const message = error instanceof Error ? error.message : String(error);
  console.error(JSON.stringify({ success: false, error: message }));
  process.exit(1);
}

/**
 * Wrap main function with error handling
 */
export async function runMain(main: () => Promise<void>): Promise<void> {
  try {
    await main();
  } catch (error) {
    handleError(error);
  }
}

// ============================================================================
// Validation Helpers
// ============================================================================

/**
 * Require a positional argument
 */
export function requireArg(
  positional: string[],
  index: number,
  name: string
): string {
  if (!positional[index]) {
    throw new Error(`Missing required argument: ${name}`);
  }
  return positional[index];
}

/**
 * Parse number from string
 */
export function parseNumber(value: string, name: string): number {
  const num = parseFloat(value);
  if (isNaN(num)) {
    throw new Error(`${name} must be a number`);
  }
  return num;
}

/**
 * Parse numbers array from string (comma or space separated)
 */
export function parseNumbers(value: string): number[] {
  return value
    .split(/[,\s]+/)
    .filter(Boolean)
    .map(n => {
      const num = parseFloat(n);
      if (isNaN(num)) {
        throw new Error(`Invalid number: ${n}`);
      }
      return num;
    });
}
