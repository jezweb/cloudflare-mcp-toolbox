/**
 * Date/Time Utility Tools
 * Default timezone: Australia/Sydney
 */

const DEFAULT_TIMEZONE = 'Australia/Sydney'

/**
 * Get current date and time in specified timezone
 */
export function getCurrentDateTime(args: {
  timezone?: string
  format?: 'iso' | 'unix' | 'readable'
}): string {
  const timezone = args.timezone || DEFAULT_TIMEZONE
  const format = args.format || 'iso'
  const now = new Date()

  if (format === 'unix') {
    return Math.floor(now.getTime() / 1000).toString()
  }

  if (format === 'iso') {
    return now.toLocaleString('en-US', {
      timeZone: timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, '$3-$1-$2T$4:$5:$6')
  }

  // readable format
  return now.toLocaleString('en-US', {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

/**
 * Convert datetime from one timezone to another
 */
export function convertTimezone(args: {
  datetime: string
  from_timezone: string
  to_timezone: string
  format?: 'iso' | 'unix' | 'readable'
}): string {
  const format = args.format || 'iso'

  // Parse input datetime
  let date: Date
  if (/^\d+$/.test(args.datetime)) {
    // Unix timestamp
    date = new Date(parseInt(args.datetime) * 1000)
  } else {
    date = new Date(args.datetime)
  }

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid datetime: ${args.datetime}`)
  }

  if (format === 'unix') {
    return Math.floor(date.getTime() / 1000).toString()
  }

  if (format === 'iso') {
    return date.toLocaleString('en-US', {
      timeZone: args.to_timezone,
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: false,
    }).replace(/(\d+)\/(\d+)\/(\d+),\s(\d+):(\d+):(\d+)/, '$3-$1-$2T$4:$5:$6')
  }

  // readable format
  return date.toLocaleString('en-US', {
    timeZone: args.to_timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}

/**
 * Calculate duration between two dates
 */
export function calculateDuration(args: {
  start: string
  end: string
  unit?: 'seconds' | 'minutes' | 'hours' | 'days'
}): string {
  const unit = args.unit || 'seconds'

  // Parse dates
  const startDate = /^\d+$/.test(args.start)
    ? new Date(parseInt(args.start) * 1000)
    : new Date(args.start)

  const endDate = /^\d+$/.test(args.end)
    ? new Date(parseInt(args.end) * 1000)
    : new Date(args.end)

  if (isNaN(startDate.getTime())) {
    throw new Error(`Invalid start date: ${args.start}`)
  }
  if (isNaN(endDate.getTime())) {
    throw new Error(`Invalid end date: ${args.end}`)
  }

  const diffMs = endDate.getTime() - startDate.getTime()
  const diffSeconds = diffMs / 1000

  switch (unit) {
    case 'seconds':
      return diffSeconds.toString()
    case 'minutes':
      return (diffSeconds / 60).toString()
    case 'hours':
      return (diffSeconds / 3600).toString()
    case 'days':
      return (diffSeconds / 86400).toString()
    default:
      return diffSeconds.toString()
  }
}

/**
 * Format date in various styles
 */
export function formatDate(args: {
  datetime: string
  format: 'iso' | 'relative' | 'short' | 'long' | 'time_only' | 'date_only'
  timezone?: string
}): string {
  const timezone = args.timezone || DEFAULT_TIMEZONE

  // Parse datetime
  const date = /^\d+$/.test(args.datetime)
    ? new Date(parseInt(args.datetime) * 1000)
    : new Date(args.datetime)

  if (isNaN(date.getTime())) {
    throw new Error(`Invalid datetime: ${args.datetime}`)
  }

  switch (args.format) {
    case 'iso':
      return date.toISOString()

    case 'relative':
      return getRelativeTime(date)

    case 'short':
      return date.toLocaleString('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'short',
        day: 'numeric',
        hour: 'numeric',
        minute: '2-digit',
      })

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
      })

    case 'time_only':
      return date.toLocaleString('en-US', {
        timeZone: timezone,
        hour: 'numeric',
        minute: '2-digit',
        second: '2-digit',
      })

    case 'date_only':
      return date.toLocaleString('en-US', {
        timeZone: timezone,
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      })

    default:
      return date.toISOString()
  }
}

/**
 * Get relative time string (e.g., "2 days ago", "in 3 hours")
 */
function getRelativeTime(date: Date): string {
  const now = Date.now()
  const diffMs = date.getTime() - now
  const diffSeconds = Math.abs(Math.floor(diffMs / 1000))
  const isPast = diffMs < 0

  if (diffSeconds < 60) {
    return isPast ? 'just now' : 'in a few seconds'
  }

  const diffMinutes = Math.floor(diffSeconds / 60)
  if (diffMinutes < 60) {
    const unit = diffMinutes === 1 ? 'minute' : 'minutes'
    return isPast ? `${diffMinutes} ${unit} ago` : `in ${diffMinutes} ${unit}`
  }

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) {
    const unit = diffHours === 1 ? 'hour' : 'hours'
    return isPast ? `${diffHours} ${unit} ago` : `in ${diffHours} ${unit}`
  }

  const diffDays = Math.floor(diffHours / 24)
  if (diffDays < 30) {
    const unit = diffDays === 1 ? 'day' : 'days'
    return isPast ? `${diffDays} ${unit} ago` : `in ${diffDays} ${unit}`
  }

  const diffMonths = Math.floor(diffDays / 30)
  if (diffMonths < 12) {
    const unit = diffMonths === 1 ? 'month' : 'months'
    return isPast ? `${diffMonths} ${unit} ago` : `in ${diffMonths} ${unit}`
  }

  const diffYears = Math.floor(diffMonths / 12)
  const unit = diffYears === 1 ? 'year' : 'years'
  return isPast ? `${diffYears} ${unit} ago` : `in ${diffYears} ${unit}`
}

/**
 * Parse natural language date expressions
 */
export function parseDate(args: {
  expression: string
  timezone?: string
  format?: 'iso' | 'unix' | 'readable'
}): string {
  const timezone = args.timezone || DEFAULT_TIMEZONE
  const format = args.format || 'iso'
  const expr = args.expression.toLowerCase().trim()

  const now = new Date()
  let targetDate = new Date(now)

  // Handle common expressions
  if (expr === 'now' || expr === 'today') {
    targetDate = now
  } else if (expr === 'tomorrow') {
    targetDate.setDate(now.getDate() + 1)
  } else if (expr === 'yesterday') {
    targetDate.setDate(now.getDate() - 1)
  } else if (expr.match(/^in (\d+) (second|minute|hour|day|week|month|year)s?$/)) {
    const match = expr.match(/^in (\d+) (second|minute|hour|day|week|month|year)s?$/)!
    const amount = parseInt(match[1])
    const unit = match[2]

    switch (unit) {
      case 'second':
        targetDate.setSeconds(now.getSeconds() + amount)
        break
      case 'minute':
        targetDate.setMinutes(now.getMinutes() + amount)
        break
      case 'hour':
        targetDate.setHours(now.getHours() + amount)
        break
      case 'day':
        targetDate.setDate(now.getDate() + amount)
        break
      case 'week':
        targetDate.setDate(now.getDate() + amount * 7)
        break
      case 'month':
        targetDate.setMonth(now.getMonth() + amount)
        break
      case 'year':
        targetDate.setFullYear(now.getFullYear() + amount)
        break
    }
  } else if (expr.match(/^(\d+) (second|minute|hour|day|week|month|year)s? ago$/)) {
    const match = expr.match(/^(\d+) (second|minute|hour|day|week|month|year)s? ago$/)!
    const amount = parseInt(match[1])
    const unit = match[2]

    switch (unit) {
      case 'second':
        targetDate.setSeconds(now.getSeconds() - amount)
        break
      case 'minute':
        targetDate.setMinutes(now.getMinutes() - amount)
        break
      case 'hour':
        targetDate.setHours(now.getHours() - amount)
        break
      case 'day':
        targetDate.setDate(now.getDate() - amount)
        break
      case 'week':
        targetDate.setDate(now.getDate() - amount * 7)
        break
      case 'month':
        targetDate.setMonth(now.getMonth() - amount)
        break
      case 'year':
        targetDate.setFullYear(now.getFullYear() - amount)
        break
    }
  } else if (expr.match(/^next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/)) {
    const match = expr.match(/^next (monday|tuesday|wednesday|thursday|friday|saturday|sunday)$/)!
    const dayName = match[1]
    const daysOfWeek = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday']
    const targetDayIndex = daysOfWeek.indexOf(dayName)
    const currentDayIndex = now.getDay()

    let daysToAdd = targetDayIndex - currentDayIndex
    if (daysToAdd <= 0) {
      daysToAdd += 7
    }

    targetDate.setDate(now.getDate() + daysToAdd)
  } else {
    throw new Error(`Unsupported expression: ${args.expression}. Try "tomorrow", "in 3 days", "next Friday", etc.`)
  }

  // Format output
  if (format === 'unix') {
    return Math.floor(targetDate.getTime() / 1000).toString()
  }

  if (format === 'iso') {
    return targetDate.toISOString()
  }

  // readable format
  return targetDate.toLocaleString('en-US', {
    timeZone: timezone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    timeZoneName: 'short',
  })
}
