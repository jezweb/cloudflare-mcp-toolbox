/**
 * Math & Calculation Utility Tools
 */

/**
 * Safe mathematical expression evaluation
 * Simple recursive descent parser for basic arithmetic
 */
export function calculate(args: { expression: string }): string {
  const expr = args.expression.trim()

  // Sanitize: only allow numbers, operators, parentheses, and spaces
  const allowedPattern = /^[\d\s+\-*/(). ^]+$/
  if (!allowedPattern.test(expr)) {
    throw new Error('Expression contains invalid characters. Only numbers, +, -, *, /, ^, (, ) are allowed.')
  }

  try {
    const result = evaluateExpression(expr)

    if (typeof result !== 'number' || !isFinite(result)) {
      throw new Error('Result is not a valid number')
    }

    return result.toString()
  } catch (error) {
    throw new Error(`Invalid expression: ${error instanceof Error ? error.message : 'unknown error'}`)
  }
}

/**
 * Simple recursive descent parser for arithmetic expressions
 */
function evaluateExpression(expr: string): number {
  let pos = 0
  const str = expr.replace(/\s/g, '') // Remove whitespace

  function peek(): string {
    return str[pos] || ''
  }

  function next(): string {
    return str[pos++] || ''
  }

  function parseNumber(): number {
    let num = ''
    while (peek() && /[\d.]/.test(peek())) {
      num += next()
    }
    return parseFloat(num)
  }

  function parseFactor(): number {
    if (peek() === '(') {
      next() // consume '('
      const val = parseExpression()
      next() // consume ')'
      return val
    }
    if (peek() === '-') {
      next()
      return -parseFactor()
    }
    return parseNumber()
  }

  function parsePower(): number {
    let left = parseFactor()
    while (peek() === '^') {
      next()
      left = Math.pow(left, parseFactor())
    }
    return left
  }

  function parseTerm(): number {
    let left = parsePower()
    while (peek() === '*' || peek() === '/') {
      const op = next()
      const right = parsePower()
      left = op === '*' ? left * right : left / right
    }
    return left
  }

  function parseExpression(): number {
    let left = parseTerm()
    while (peek() === '+' || peek() === '-') {
      const op = next()
      const right = parseTerm()
      left = op === '+' ? left + right : left - right
    }
    return left
  }

  return parseExpression()
}

/**
 * Convert between units of measurement
 */
export function convertUnits(args: {
  value: number
  from_unit: string
  to_unit: string
}): string {
  const { value, from_unit, to_unit } = args

  // Conversion factors (to base unit)
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
  }

  const fromUnit = conversions[from_unit.toLowerCase()]
  const toUnit = conversions[to_unit.toLowerCase()]

  if (!fromUnit) {
    throw new Error(`Unknown unit: ${from_unit}`)
  }
  if (!toUnit) {
    throw new Error(`Unknown unit: ${to_unit}`)
  }

  // Temperature (special case - not linear conversion)
  if (from_unit.toLowerCase() === 'celsius' && to_unit.toLowerCase() === 'fahrenheit') {
    return ((value * 9/5) + 32).toString()
  }
  if (from_unit.toLowerCase() === 'fahrenheit' && to_unit.toLowerCase() === 'celsius') {
    return ((value - 32) * 5/9).toString()
  }
  if (from_unit.toLowerCase() === 'celsius' && to_unit.toLowerCase() === 'kelvin') {
    return (value + 273.15).toString()
  }
  if (from_unit.toLowerCase() === 'kelvin' && to_unit.toLowerCase() === 'celsius') {
    return (value - 273.15).toString()
  }

  if (fromUnit.category !== toUnit.category) {
    throw new Error(`Cannot convert between ${fromUnit.category} and ${toUnit.category}`)
  }

  // Convert to base unit, then to target unit
  const baseValue = value * fromUnit.factor
  const result = baseValue / toUnit.factor

  return result.toString()
}

/**
 * Calculate statistical measures
 */
export function statistics(args: {
  numbers: number[]
  metrics?: string[]
}): string {
  const { numbers, metrics } = args

  if (!numbers || numbers.length === 0) {
    throw new Error('numbers array is required and cannot be empty')
  }

  const metricsToCalc = metrics || ['mean', 'median', 'mode', 'stddev', 'min', 'max']
  const results: Record<string, number | number[]> = {}

  if (metricsToCalc.includes('mean')) {
    const sum = numbers.reduce((a, b) => a + b, 0)
    results.mean = sum / numbers.length
  }

  if (metricsToCalc.includes('median')) {
    const sorted = [...numbers].sort((a, b) => a - b)
    const mid = Math.floor(sorted.length / 2)
    results.median = sorted.length % 2 === 0
      ? (sorted[mid - 1] + sorted[mid]) / 2
      : sorted[mid]
  }

  if (metricsToCalc.includes('mode')) {
    const frequency: Record<number, number> = {}
    let maxFreq = 0

    numbers.forEach(num => {
      frequency[num] = (frequency[num] || 0) + 1
      maxFreq = Math.max(maxFreq, frequency[num])
    })

    const modes = Object.keys(frequency)
      .filter(key => frequency[Number(key)] === maxFreq)
      .map(Number)

    results.mode = modes.length === 1 ? modes[0] : modes
  }

  if (metricsToCalc.includes('stddev') || metricsToCalc.includes('variance')) {
    const mean = numbers.reduce((a, b) => a + b, 0) / numbers.length
    const squaredDiffs = numbers.map(num => Math.pow(num - mean, 2))
    const variance = squaredDiffs.reduce((a, b) => a + b, 0) / numbers.length

    if (metricsToCalc.includes('variance')) {
      results.variance = variance
    }
    if (metricsToCalc.includes('stddev')) {
      results.stddev = Math.sqrt(variance)
    }
  }

  if (metricsToCalc.includes('min')) {
    results.min = Math.min(...numbers)
  }

  if (metricsToCalc.includes('max')) {
    results.max = Math.max(...numbers)
  }

  if (metricsToCalc.includes('sum')) {
    results.sum = numbers.reduce((a, b) => a + b, 0)
  }

  if (metricsToCalc.includes('count')) {
    results.count = numbers.length
  }

  return JSON.stringify(results, null, 2)
}

/**
 * Generate cryptographically secure random number
 */
export function randomNumber(args: {
  min?: number
  max?: number
  integer?: boolean
}): string {
  const min = args.min !== undefined ? args.min : 0
  const max = args.max !== undefined ? args.max : 1
  const integer = args.integer || false

  // Use crypto.getRandomValues for secure random
  const randomBuffer = new Uint32Array(1)
  crypto.getRandomValues(randomBuffer)

  // Convert to 0-1 range
  const random = randomBuffer[0] / (0xffffffff + 1)

  // Scale to desired range
  const result = min + random * (max - min)

  return integer ? Math.floor(result).toString() : result.toString()
}

/**
 * Calculate percentages and percentage changes
 */
export function percentage(args: {
  operation: 'of' | 'change' | 'is_what_percent'
  value1: number
  value2: number
}): string {
  const { operation, value1, value2 } = args

  switch (operation) {
    case 'of':
      // value1 percent of value2
      return ((value1 / 100) * value2).toString()

    case 'change':
      // Percentage change from value1 to value2
      if (value1 === 0) {
        throw new Error('Cannot calculate percentage change from zero')
      }
      const change = ((value2 - value1) / Math.abs(value1)) * 100
      return `${change.toFixed(2)}%`

    case 'is_what_percent':
      // value1 is what percent of value2
      if (value2 === 0) {
        throw new Error('Cannot divide by zero')
      }
      return `${((value1 / value2) * 100).toFixed(2)}%`

    default:
      throw new Error(`Unknown operation: ${operation}`)
  }
}

/**
 * Roll dice with standard notation (e.g., "2d6", "1d20", "3d10+5")
 */
export function rollDice(args: {
  notation: string
}): string {
  const { notation } = args

  // Parse dice notation: XdY+Z or XdY-Z or XdY
  const match = notation.match(/^(\d+)d(\d+)([+-]\d+)?$/i)
  if (!match) {
    throw new Error('Invalid dice notation. Use format: XdY or XdY+Z (e.g., "2d6", "1d20+5", "3d8-2")')
  }

  const numDice = parseInt(match[1])
  const numSides = parseInt(match[2])
  const modifier = match[3] ? parseInt(match[3]) : 0

  if (numDice < 1 || numDice > 100) {
    throw new Error('Number of dice must be between 1 and 100')
  }

  if (numSides < 2 || numSides > 1000) {
    throw new Error('Number of sides must be between 2 and 1000')
  }

  // Roll each die
  const rolls: number[] = []
  for (let i = 0; i < numDice; i++) {
    const randomBuffer = new Uint32Array(1)
    crypto.getRandomValues(randomBuffer)
    const random = randomBuffer[0] / (0xffffffff + 1)
    const roll = Math.floor(random * numSides) + 1
    rolls.push(roll)
  }

  const sum = rolls.reduce((a, b) => a + b, 0)
  const total = sum + modifier

  const result = {
    notation,
    rolls,
    sum,
    modifier: modifier !== 0 ? modifier : undefined,
    total,
  }

  return JSON.stringify(result, null, 2)
}
