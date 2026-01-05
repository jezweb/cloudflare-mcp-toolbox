#!/usr/bin/env npx tsx
/**
 * DateTime Utilities CLI
 * Tools for date/time operations, timezone conversions, and natural language parsing
 *
 * Usage:
 *   npx tsx scripts/datetime.ts <command> [args...]
 *   npx tsx scripts/datetime.ts now [--timezone TZ] [--format iso|unix|readable]
 *   npx tsx scripts/datetime.ts convert <datetime> --from TZ --to TZ
 *   npx tsx scripts/datetime.ts duration <start> <end> [--unit days|hours|minutes|seconds]
 *   npx tsx scripts/datetime.ts format <datetime> --as iso|relative|short|long|time|date
 *   npx tsx scripts/datetime.ts parse <expression> [--timezone TZ]
 *
 * Examples:
 *   npx tsx scripts/datetime.ts now
 *   npx tsx scripts/datetime.ts now --timezone "America/New_York"
 *   npx tsx scripts/datetime.ts convert "2024-01-15T10:00:00" --from UTC --to "Australia/Sydney"
 *   npx tsx scripts/datetime.ts duration "2024-01-01" "2024-12-31" --unit days
 *   npx tsx scripts/datetime.ts format "2024-01-15T10:00:00Z" --as relative
 *   npx tsx scripts/datetime.ts parse "next friday"
 */

import {
  parseBaseArgs,
  formatOutput,
  writeOutput,
  handleError,
  runMain,
  requireArg,
  readInputLines,
} from './_shared.js';

// ============================================================================
// Configuration
// ============================================================================

const DEFAULT_TIMEZONE = 'Australia/Sydney';

// ============================================================================
// Core Functions (from handlers/datetime.ts)
// ============================================================================

function getCurrentDateTime(args: {
  timezone?: string;
  format?: 'iso' | 'unix' | 'readable';
}): string {
  const timezone = args.timezone || DEFAULT_TIMEZONE;
  const format = args.format || 'iso';
  const now = new Date();

  if (format === 'unix') {
    return Math.floor(now.getTime() / 1000).toString();
  }

  if (format === 'iso') {
    return now
      .toLocaleString('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, '$3-$1-$2T$4:$5:$6');
  }

  return now.toLocaleString('en-US', {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function convertTimezone(args: {
  datetime: string;
  from_timezone: string;
  to_timezone: string;
  format?: 'iso' | 'unix' | 'readable';
}): string {
  const format = args.format || 'iso';

  let date: Date;
  if (/^\d+$/.test(args.datetime)) {
    date = new Date(parseInt(args.datetime) * 1000);
  } else {
    date = new Date(args.datetime);
  }

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid datetime: ${args.datetime}`);
  }

  if (format === 'unix') {
    return Math.floor(date.getTime() / 1000).toString();
  }

  if (format === 'iso') {
    return date
      .toLocaleString('en-US', {
        timeZone: args.to_timezone,
        year: 'numeric',
        month: '2-digit',
        day: '2-digit',
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      })
      .replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, '$3-$1-$2T$4:$5:$6');
  }

  return date.toLocaleString('en-US', {
    timeZone: args.to_timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  });
}

function calculateDuration(args: {
  start: string;
  end: string;
  unit?: 'seconds' | 'minutes' | 'hours' | 'days';
}): { value: number; unit: string; start: string; end: string } {
  const unit = args.unit || 'seconds';

  const startDate = /^\d+$/.test(args.start)
    ? new Date(parseInt(args.start) * 1000)
    : new Date(args.start);

  const endDate = /^\d+$/.test(args.end)
    ? new Date(parseInt(args.end) * 1000)
    : new Date(args.end);

  if (isNaN(startDate.getTime())) {
    throw new Error(`Invalid start date: ${args.start}`);
  }
  if (isNaN(endDate.getTime())) {
    throw new Error(`Invalid end date: ${args.end}`);
  }

  const diffMs = endDate.getTime() - startDate.getTime();
  const diffSeconds = diffMs / 1000;

  let value: number;
  switch (unit) {
    case 'minutes':
      value = diffSeconds / 60;
      break;
    case 'hours':
      value = diffSeconds / 3600;
      break;
    case 'days':
      value = diffSeconds / 86400;
      break;
    default:
      value = diffSeconds;
  }

  return {
    value,
    unit,
    start: startDate.toISOString(),
    end: endDate.toISOString(),
  };
}

function getRelativeTime(date: Date): string {
  const now = Date.now();
  const diffMs = date.getTime() - now;
  const diffSeconds = Math.abs(Math.floor(diffMs / 1000));
  const isPast = diffMs < 0;

  if (diffSeconds < 60) {
    return isPast ? 'just now' : 'in a few seconds';
  }

  const diffMinutes = Math.floor(diffSeconds / 60);
  if (diffMinutes < 60) {
    const unit = diffMinutes === 1 ? 'minute' : 'minutes';
    return isPast ? `${diffMinutes} ${unit} ago` : `in ${diffMinutes} ${unit}`;
  }

  const diffHours = Math.floor(diffMinutes / 60);
  if (diffHours < 24) {
    const unit = diffHours === 1 ? 'hour' : 'hours';
    return isPast ? `${diffHours} ${unit} ago` : `in ${diffHours} ${unit}`;
  }

  const diffDays = Math.floor(diffHours / 24);
  if (diffDays < 30) {
    const unit = diffDays === 1 ? 'day' : 'days';
    return isPast ? `${diffDays} ${unit} ago` : `in ${diffDays} ${unit}`;
  }

  const diffMonths = Math.floor(diffDays / 30);
  if (diffMonths < 12) {
    const unit = diffMonths === 1 ? 'month' : 'months';
    return isPast ? `${diffMonths} ${unit} ago` : `in ${diffMonths} ${unit}`;
  }

  const diffYears = Math.floor(diffMonths / 12);
  const unit = diffYears === 1 ? 'year' : 'years';
  return isPast ? `${diffYears} ${unit} ago` : `in ${diffYears} ${unit}`;
}

function formatDate(args: {
  datetime: string;
  format: 'iso' | 'relative' | 'short' | 'long' | 'time_only' | 'date_only';
  timezone?: string;
}): string {
  const timezone = args.timezone || DEFAULT_TIMEZONE;

  const date = /^\d+$/.test(args.datetime)
    ? new Date(parseInt(args.datetime) * 1000)
    : new Date(args.datetime);

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid datetime: ${args.datetime}`);
  }

  switch (args.format) {
    case 'iso':
      return date.toISOString();

    case 'relative':
      return getRelativeTime(date);

    case 'short':
      return date.toLocaleString('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      });

    case 'long':
      return date.toLocaleString('en-US', {
        timeZone: timezone,
        weekday: 'long',
        year: 'numeric',
        month: 'long',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
        timeZoneName: 'short',
      });

    case 'time_only':
      return date.toLocaleString('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      });

    case 'date_only':
      return date.toLocaleString('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });

    default:
      return date.toISOString();
  }
}

function parseDate(args: {
  expression: string;
  timezone?: string;
  format?: 'iso' | 'unix' | 'readable';
}): { parsed: string; expression: string; timezone: string } {
  const timezone = args.timezone || DEFAULT_TIMEZONE;
  const format = args.format || 'iso';
  const expr = args.expression.toLowerCase().trim();

  const now = new Date();
  let targetDate = new Date(now);

  if (expr === 'now' || expr === 'today') {
    targetDate = now;
  } else if (expr === 'tomorrow') {
    targetDate.setDate(now.getDate() + 1);
  } else if (expr === 'yesterday') {
    targetDate.setDate(now.getDate() - 1);
  } else if (expr.match(/^in (\d+) (second|minute|hour|day|week|month|year)s?$/)) {
    const match = expr.match(/^in (\d+) (second|minute|hour|day|week|month|year)s?$/)!;
    const amount = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'second':
        targetDate.setSeconds(now.getSeconds() + amount);
        break;
      case 'minute':
        targetDate.setMinutes(now.getMinutes() + amount);
        break;
      case 'hour':
        targetDate.setHours(now.getHours() + amount);
        break;
      case 'day':
        targetDate.setDate(now.getDate() + amount);
        break;
      case 'week':
        targetDate.setDate(now.getDate() + amount * 7);
        break;
      case 'month':
        targetDate.setMonth(now.getMonth() + amount);
        break;
      case 'year':
        targetDate.setFullYear(now.getFullYear() + amount);
        break;
    }
  } else if (expr.match(/^(\d+) (second|minute|hour|day|week|month|year)s? ago$/)) {
    const match = expr.match(/^(\d+) (second|minute|hour|day|week|month|year)s? ago$/)!;
    const amount = parseInt(match[1]);
    const unit = match[2];

    switch (unit) {
      case 'second':
        targetDate.setSeconds(now.getSeconds() - amount);
        break;
      case 'minute':
        targetDate.setMinutes(now.getMinutes() - amount);
        break;
      case 'hour':
        targetDate.setHours(now.getHours() - amount);
        break;
      case 'day':
        targetDate.setDate(now.getDate() - amount);
        break;
      case 'week':
        targetDate.setDate(now.getDate() - amount * 7);
        break;
      case 'month':
        targetDate.setMonth(now.getMonth() - amount);
        break;
      case 'year':
        targetDate.setFullYear(now.getFullYear() - amount);
        break;
    }
  } else if (expr.match(/^next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/)) {
    const match = expr.match(/^next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/)!;
    const dayName = match[1];
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];
    const targetDayIndex = daysOfWeek.indexOf(dayName);
    const currentDayIndex = now.getDay();

    let daysToAdd = targetDayIndex - currentDayIndex;
    if (daysToAdd <= 0) {
      daysToAdd += 7;
    }

    targetDate.setDate(now.getDate() + daysToAdd);
  } else {
    throw new Error(
      `Unsupported expression: ${args.expression}. Try "tomorrow", "in 3 days", "next Friday", etc.`
    );
  }

  let parsed: string;
  if (format === 'unix') {
    parsed = Math.floor(targetDate.getTime() / 1000).toString();
  } else if (format === 'iso') {
    parsed = targetDate.toISOString();
  } else {
    parsed = targetDate.toLocaleString('en-US', {
      timeZone: timezone,
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      timeZoneName: 'short',
    });
  }

  return { parsed, expression: args.expression, timezone };
}

// ============================================================================
// CLI Commands
// ============================================================================

function showHelp(): void {
  console.log(`
DateTime Utilities CLI
Tools for date/time operations, timezone conversions, and natural language parsing

USAGE:
  npx tsx scripts/datetime.ts <command> [args...] [options]

COMMANDS:
  now                     Get current date/time
  convert <datetime>      Convert between timezones
  duration <start> <end>  Calculate duration between dates
  format <datetime>       Format date in various styles
  parse <expression>      Parse natural language date expressions

OPTIONS:
  --timezone <tz>    Timezone (default: Australia/Sydney)
  --format <fmt>     Output format: iso, unix, readable (default: iso)
  --from <tz>        Source timezone (for convert)
  --to <tz>          Target timezone (for convert)
  --unit <u>         Duration unit: seconds, minutes, hours, days
  --as <style>       Format style: iso, relative, short, long, time, date
  --input <file>     Read expressions from file (batch mode)
  --output <file>    Write results to file
  --verbose          Show debug information
  --help             Show this help

EXAMPLES:
  # Get current time
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
    case 'now': {
      const timezone = (raw['timezone'] as string) || DEFAULT_TIMEZONE;
      const format = (raw['format'] as 'iso' | 'unix' | 'readable') || 'iso';
      const datetime = getCurrentDateTime({ timezone, format });
      result = { success: true, datetime, timezone, format };
      break;
    }

    case 'convert': {
      const datetime = requireArg(positional, 1, 'datetime');
      const from_timezone = raw['from'] as string;
      const to_timezone = raw['to'] as string;

      if (!from_timezone || !to_timezone) {
        throw new Error('Both --from and --to timezones are required');
      }

      const format = (raw['format'] as 'iso' | 'unix' | 'readable') || 'iso';
      const converted = convertTimezone({ datetime, from_timezone, to_timezone, format });
      result = {
        success: true,
        original: datetime,
        converted,
        from: from_timezone,
        to: to_timezone,
      };
      break;
    }

    case 'duration': {
      const start = requireArg(positional, 1, 'start date');
      const end = requireArg(positional, 2, 'end date');
      const unit = (raw['unit'] as 'seconds' | 'minutes' | 'hours' | 'days') || 'days';
      const duration = calculateDuration({ start, end, unit });
      result = { success: true, ...duration };
      break;
    }

    case 'format': {
      const datetime = requireArg(positional, 1, 'datetime');
      const formatStyle = (raw['as'] as string) || 'iso';
      const timezone = (raw['timezone'] as string) || DEFAULT_TIMEZONE;

      // Map short names to full names
      const styleMap: Record<string, 'iso' | 'relative' | 'short' | 'long' | 'time_only' | 'date_only'> = {
        iso: 'iso',
        relative: 'relative',
        short: 'short',
        long: 'long',
        time: 'time_only',
        time_only: 'time_only',
        date: 'date_only',
        date_only: 'date_only',
      };

      const format = styleMap[formatStyle] || 'iso';
      const formatted = formatDate({ datetime, format, timezone });
      result = { success: true, original: datetime, formatted, format, timezone };
      break;
    }

    case 'parse': {
      // Check for batch mode
      if (flags.input) {
        const expressions = readInputLines(flags.input);
        const timezone = (raw['timezone'] as string) || DEFAULT_TIMEZONE;
        const format = (raw['format'] as 'iso' | 'unix' | 'readable') || 'iso';

        const results = expressions.map(expr => {
          try {
            return { success: true, ...parseDate({ expression: expr, timezone, format }) };
          } catch (error) {
            return {
              success: false,
              expression: expr,
              error: error instanceof Error ? error.message : String(error),
            };
          }
        });

        result = { success: true, count: results.length, results };
      } else {
        const expression = requireArg(positional, 1, 'expression');
        const timezone = (raw['timezone'] as string) || DEFAULT_TIMEZONE;
        const format = (raw['format'] as 'iso' | 'unix' | 'readable') || 'iso';
        result = { success: true, ...parseDate({ expression, timezone, format }) };
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
