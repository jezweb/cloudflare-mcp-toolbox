#!/usr/bin/env npx tsx
/**
 * Math Utilities CLI
 * Tools for calculations, unit conversions, statistics, and random number generation
 *
 * Usage:
 *   npx tsx scripts/math.ts <command> [args...]
 *   npx tsx scripts/math.ts calc <expression>
 *   npx tsx scripts/math.ts convert <value> <from> <to>
 *   npx tsx scripts/math.ts stats <numbers...>
 *   npx tsx scripts/math.ts random [--min N] [--max N] [--integer]
 *   npx tsx scripts/math.ts percent <operation> <value1> <value2>
 *   npx tsx scripts/math.ts dice <notation>
 *
 * Examples:
 *   npx tsx scripts/math.ts calc "2 + 3 * 4"
 *   npx tsx scripts/math.ts convert 100 km miles
 *   npx tsx scripts/math.ts stats 1,2,3,4,5
 *   npx tsx scripts/math.ts random --min 1 --max 100 --integer
 *   npx tsx scripts/math.ts percent change 100 150
 *   npx tsx scripts/math.ts dice 2d6+3
 */

import * as crypto from 'crypto';
import {
  parseBaseArgs,
  formatOutput,
  writeOutput,
  handleError,
  runMain,
  requireArg,
  parseNumbers,
  readInputLines,
} from './_shared.js';

// ============================================================================
// Core Functions (from handlers/math.ts)
// ============================================================================

/**
 * Simple recursive descent parser for arithmetic expressions
 */
function evaluateExpression(expr: string): number {
  let pos = 0;
  const str = expr.replace(/\s/g, '');

  function peek(): string {
    return str[pos] || '';
  }

  function next(): string {
    return str[pos++] || '';
  }

  function parseNumber(): number {
    let num = '';
    while (peek() && /[\d.]/.test(peek())) {
      num += next();
    }
    return parseFloat(num);
  }

  function parseFactor(): number {
    if (peek() === '(') {
      next();
      const val = parseExpression();
      next();
      return val;
    }
    if (peek() === '-') {
      next();
      return -parseFactor();
    }
    return parseNumber();
  }

  function parsePower(): number {
    let left = parseFactor();
    while (peek() === '^') {
      next();
      left = Math.pow(left, parseFactor());
    }
    return left;
  }

  function parseTerm(): number {
    let left = parsePower();
    while (peek() === '*' || peek() === '/') {
      const op = next();
      const right = parsePower();
      left = op === '*' ? left * right : left / right;
    }
    return left;
  }

  function parseExpression(): number {
    let left = parseTerm();
    while (peek() === '+' || peek() === '-') {
      const op = next();
      const right = parseTerm();
      left = op === '+' ? left + right : left - right;
    }
    return left;
  }

  return parseExpression();
}

function calculate(expression: string): { expression: string; result: number } {
  const expr = expression.trim();

  const allowedPattern = /^[\d\s+\-*/(). ^]+$/;
  if (!allowedPattern.test(expr)) {
    throw new Error('Expression contains invalid characters. Only numbers, +, -, *, /, ^, (, ) are allowed.');
  }

  const result = evaluateExpression(expr);

  if (typeof result !== 'number' || !isFinite(result)) {
    throw new Error('Result is not a valid number');
  }

  return { expression: expr, result };
}

function convertUnits(args: {
  value: number;
  from_unit: string;
  to_unit: string;
}): { value: number; from: string; to: string; result: number } {
  const { value, from_unit, to_unit } = args;

  const conversions: Record<string, { base: string; factor: number; category: string }> = {
    // Length (base: meters)
    m: { base: 'm', factor: 1, category: 'length' },
    km: { base: 'm', factor: 1000, category: 'length' },
    cm: { base: 'm', factor: 0.01, category: 'length' },
    mm: { base: 'm', factor: 0.001, category: 'length' },
    miles: { base: 'm', factor: 1609.34, category: 'length' },
    yards: { base: 'm', factor: 0.9144, category: 'length' },
    feet: { base: 'm', factor: 0.3048, category: 'length' },
    inches: { base: 'm', factor: 0.0254, category: 'length' },

    // Weight (base: kilograms)
    kg: { base: 'kg', factor: 1, category: 'weight' },
    g: { base: 'kg', factor: 0.001, category: 'weight' },
    mg: { base: 'kg', factor: 0.000001, category: 'weight' },
    lbs: { base: 'kg', factor: 0.453592, category: 'weight' },
    oz: { base: 'kg', factor: 0.0283495, category: 'weight' },

    // Volume (base: liters)
    liters: { base: 'liters', factor: 1, category: 'volume' },
    ml: { base: 'liters', factor: 0.001, category: 'volume' },
    gallons: { base: 'liters', factor: 3.78541, category: 'volume' },
    cups: { base: 'liters', factor: 0.236588, category: 'volume' },

    // Time (base: seconds)
    seconds: { base: 'seconds', factor: 1, category: 'time' },
    minutes: { base: 'seconds', factor: 60, category: 'time' },
    hours: { base: 'seconds', factor: 3600, category: 'time' },
    days: { base: 'seconds', factor: 86400, category: 'time' },
    weeks: { base: 'seconds', factor: 604800, category: 'time' },
  };

  // Temperature special cases
  if (from_unit.toLowerCase() === 'celsius' && to_unit.toLowerCase() === 'fahrenheit') {
    return { value, from: from_unit, to: to_unit, result: (value * 9) / 5 + 32 };
  }
  if (from_unit.toLowerCase() === 'fahrenheit' && to_unit.toLowerCase() === 'celsius') {
    return { value, from: from_unit, to: to_unit, result: ((value - 32) * 5) / 9 };
  }
  if (from_unit.toLowerCase() === 'celsius' && to_unit.toLowerCase() === 'kelvin') {
    return { value, from: from_unit, to: to_unit, result: value + 273.15 };
  }
  if (from_unit.toLowerCase() === 'kelvin' && to_unit.toLowerCase() === 'celsius') {
    return { value, from: from_unit, to: to_unit, result: value - 273.15 };
  }

  const fromUnit = conversions[from_unit.toLowerCase()];
  const toUnit = conversions[to_unit.toLowerCase()];

  if (!fromUnit) {
    throw new Error(`Unknown unit: ${from_unit}`);
  }
  if (!toUnit) {
    throw new Error(`Unknown unit: ${to_unit}`);
  }

  if (fromUnit.category !== toUnit.category) {
    throw new Error(`Cannot convert between ${fromUnit.category} and ${toUnit.category}`);
  }

  const baseValue = value * fromUnit.factor;
  const result = baseValue / toUnit.factor;

  return { value, from: from_unit, to: to_unit, result };
}

function statistics(args: {
  numbers: number[];
  metrics?: string[];
}): Record<string, number | number[]> {
  const { numbers, metrics } = args;

  if (!numbers || numbers.length === 0) {
    throw new Error('numbers array is required and cannot be empty');
  }

  const metricsToCalc = metrics || ['mean', 'median', 'mode', 'stddev', 'min', 'max', 'sum', 'count'];
  const results: Record<string, number | number[]> = {};

  if (metricsToCalc.includes('mean')) {
    const sum = numbers.reduce((a, b) => a + b, 0);
    results.mean = sum / numbers.length;
  }

  if (metricsToCalc.includes('median')) {
    const sorted = [...numbers].sort((a, b) => a - b);
    const mid = Math.floor(sorted.length / 2);
    results.median = sorted.length % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];
  }

  if (metricsToCalc.includes('mode')) {
    const frequency: Record<number, number> = {};
    let maxFreq = 0;

    numbers.forEach(num => {
      frequency[num] = (frequency[num] || 0) + 1;
      maxFreq = Math.max(maxFreq, frequency[num]);
    });

    const modes = Object.keys(frequency)
      .filter(key => frequency[Number(key)] === maxFreq)
      .map(Number);

    results.mode = modes.length === 1 ? modes[0] : modes;
  }

  if (metricsToCalc.includes('stddev') || metricsToCalc.includes('variance')) {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length;
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2));
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length;

    if (metricsToCalc.includes('variance')) {
      results.variance = variance;
    }
    if (metricsToCalc.includes('stddev')) {
      results.stddev = Math.sqrt(variance);
    }
  }

  if (metricsToCalc.includes('min')) {
    results.min = Math.min(...numbers);
  }

  if (metricsToCalc.includes('max')) {
    results.max = Math.max(...numbers);
  }

  if (metricsToCalc.includes('sum')) {
    results.sum = numbers.reduce((a, b) => a + b, 0);
  }

  if (metricsToCalc.includes('count')) {
    results.count = numbers.length;
  }

  return results;
}

function randomNumber(args: {
  min?: number;
  max?: number;
  integer?: boolean;
}): { min: number; max: number; result: number; integer: boolean } {
  const min = args.min !== undefined ? args.min : 0;
  const max = args.max !== undefined ? args.max : 1;
  const integer = args.integer || false;

  const randomBuffer = new Uint32Array(1);
  crypto.getRandomValues(randomBuffer);
  const random = randomBuffer[0] / (0xffffffff + 1);
  const result = min + random * (max - min);

  return {
    min,
    max,
    result: integer ? Math.floor(result) : result,
    integer,
  };
}

function percentage(args: {
  operation: 'of' | 'change' | 'is_what_percent';
  value1: number;
  value2: number;
}): { operation: string; value1: number; value2: number; result: string } {
  const { operation, value1, value2 } = args;

  let result: string;
  switch (operation) {
    case 'of':
      result = ((value1 / 100) * value2).toString();
      break;

    case 'change':
      if (value1 === 0) {
        throw new Error('Cannot calculate percentage change from zero');
      }
      result = `${(((value2 - value1) / Math.abs(value1)) * 100).toFixed(2)}%`;
      break;

    case 'is_what_percent':
      if (value2 === 0) {
        throw new Error('Cannot divide by zero');
      }
      result = `${((value1 / value2) * 100).toFixed(2)}%`;
      break;

    default:
      throw new Error(`Unknown operation: ${operation}`);
  }

  return { operation, value1, value2, result };
}

function rollDice(notation: string): {
  notation: string;
  rolls: number[];
  sum: number;
  modifier?: number;
  total: number;
} {
  const match = notation.match(/^(\d+)d(\d+)([+-]\d+)?$/i);
  if (!match) {
    throw new Error('Invalid dice notation. Use format: XdY or XdY+Z (e.g., "2d6", "1d20+5", "3d8-2")');
  }

  const numDice = parseInt(match[1]);
  const numSides = parseInt(match[2]);
  const modifier = match[3] ? parseInt(match[3]) : 0;

  if (numDice < 1 || numDice > 100) {
    throw new Error('Number of dice must be between 1 and 100');
  }

  if (numSides < 2 || numSides > 1000) {
    throw new Error('Number of sides must be between 2 and 1000');
  }

  const rolls: number[] = [];
  for (let i = 0; i < numDice; i++) {
    const randomBuffer = new Uint32Array(1);
    crypto.getRandomValues(randomBuffer);
    const random = randomBuffer[0] / (0xffffffff + 1);
    const roll = Math.floor(random * numSides) + 1;
    rolls.push(roll);
  }

  const sum = rolls.reduce((a, b) => a + b, 0);
  const total = sum + modifier;

  return {
    notation,
    rolls,
    sum,
    modifier: modifier !== 0 ? modifier : undefined,
    total,
  };
}

// ============================================================================
// CLI Commands
// ============================================================================

function showHelp(): void {
  console.log(`
Math Utilities CLI
Tools for calculations, unit conversions, statistics, and random number generation

USAGE:
  npx tsx scripts/math.ts <command> [args...] [options]

COMMANDS:
  calc <expression>          Evaluate mathematical expression
  convert <value> <from> <to> Convert between units
  stats <numbers...>         Calculate statistics
  random                     Generate random number
  percent <op> <v1> <v2>     Calculate percentages
  dice <notation>            Roll dice

SUPPORTED UNITS:
  Length:  m, km, cm, mm, miles, yards, feet, inches
  Weight:  kg, g, mg, lbs, oz
  Volume:  liters, ml, gallons, cups
  Time:    seconds, minutes, hours, days, weeks
  Temp:    celsius, fahrenheit, kelvin

PERCENTAGE OPERATIONS:
  of              - value1% of value2 (e.g., "20 of 100" = 20)
  change          - percent change from value1 to value2
  is_what_percent - value1 is what percent of value2

OPTIONS:
  --min <n>        Minimum for random (default: 0)
  --max <n>        Maximum for random (default: 1)
  --integer        Generate integer random number
  --metrics <list> Stats metrics: mean,median,mode,stddev,min,max,sum,count
  --input <file>   Read expressions from file (batch mode)
  --output <file>  Write results to file
  --format <fmt>   Output format: json, csv, table
  --verbose        Show debug information
  --help           Show this help

EXAMPLES:
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

  # Batch processing
  npx tsx scripts/math.ts calc --input expressions.txt --output results.json
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
    case 'calc':
    case 'calculate': {
      if (flags.input) {
        const expressions = readInputLines(flags.input);
        const results = expressions.map(expr => {
          try {
            return { success: true, ...calculate(expr) };
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
        result = { success: true, ...calculate(expression) };
      }
      break;
    }

    case 'convert': {
      const value = parseFloat(requireArg(positional, 1, 'value'));
      const from_unit = requireArg(positional, 2, 'from unit');
      const to_unit = requireArg(positional, 3, 'to unit');

      if (isNaN(value)) {
        throw new Error('Value must be a number');
      }

      result = { success: true, ...convertUnits({ value, from_unit, to_unit }) };
      break;
    }

    case 'stats':
    case 'statistics': {
      let numbers: number[];

      if (flags.input) {
        const lines = readInputLines(flags.input);
        numbers = lines.flatMap(line => parseNumbers(line));
      } else {
        const numArgs = positional.slice(1);
        if (numArgs.length === 0) {
          throw new Error('Provide numbers as arguments or via --input');
        }
        numbers = numArgs.flatMap(arg => parseNumbers(arg));
      }

      const metrics = raw['metrics'] ? (raw['metrics'] as string).split(',') : undefined;
      const stats = statistics({ numbers, metrics });
      result = { success: true, count: numbers.length, ...stats };
      break;
    }

    case 'random': {
      const min = raw['min'] !== undefined ? parseFloat(raw['min'] as string) : undefined;
      const max = raw['max'] !== undefined ? parseFloat(raw['max'] as string) : undefined;
      const integer = !!raw['integer'];
      result = { success: true, ...randomNumber({ min, max, integer }) };
      break;
    }

    case 'percent':
    case 'percentage': {
      const operation = requireArg(positional, 1, 'operation') as 'of' | 'change' | 'is_what_percent';
      const value1 = parseFloat(requireArg(positional, 2, 'value1'));
      const value2 = parseFloat(requireArg(positional, 3, 'value2'));

      if (isNaN(value1) || isNaN(value2)) {
        throw new Error('Values must be numbers');
      }

      result = { success: true, ...percentage({ operation, value1, value2 }) };
      break;
    }

    case 'dice':
    case 'roll': {
      const notation = requireArg(positional, 1, 'dice notation');
      result = { success: true, ...rollDice(notation) };
      break;
    }

    default:
      throw new Error(`Unknown command: ${command}. Use --help for usage.`);
  }

  const output = formatOutput(result, flags.format);
  writeOutput(output, flags.output, flags.verbose);
}

runMain(main);
