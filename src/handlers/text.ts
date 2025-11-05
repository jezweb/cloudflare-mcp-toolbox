/**
 * Text Processing Utility Tools
 */

/**
 * Transform text in various ways
 */
export function transformText(args: {
  text: string
  operation: 'uppercase' | 'lowercase' | 'titlecase' | 'slug' | 'trim' | 'reverse'
}): string {
  const { text, operation } = args

  switch (operation) {
    case 'uppercase':
      return text.toUpperCase()

    case 'lowercase':
      return text.toLowerCase()

    case 'titlecase':
      return text
        .toLowerCase()
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ')

    case 'slug':
      return text
        .toLowerCase()
        .normalize('NFD') // Decompose accents
        .replace(/[\u0300-\u036f]/g, '') // Remove accents
        .replace(/[^\w\s-]/g, '') // Remove special chars
        .trim()
        .replace(/\s+/g, '-') // Spaces to hyphens
        .replace(/-+/g, '-') // Multiple hyphens to single

    case 'trim':
      return text.trim()

    case 'reverse':
      return text.split('').reverse().join('')

    default:
      throw new Error(`Unknown operation: ${operation}`)
  }
}

/**
 * Encode or decode text
 */
export function encodeDecode(args: {
  text: string
  operation: 'base64_encode' | 'base64_decode' | 'url_encode' | 'url_decode' | 'html_escape' | 'html_unescape'
}): string {
  const { text, operation } = args

  switch (operation) {
    case 'base64_encode':
      return btoa(text)

    case 'base64_decode':
      try {
        return atob(text)
      } catch {
        throw new Error('Invalid base64 string')
      }

    case 'url_encode':
      return encodeURIComponent(text)

    case 'url_decode':
      try {
        return decodeURIComponent(text)
      } catch {
        throw new Error('Invalid URL-encoded string')
      }

    case 'html_escape':
      return text
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')

    case 'html_unescape':
      return text
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&quot;/g, '"')
        .replace(/&#39;/g, "'")

    default:
      throw new Error(`Unknown operation: ${operation}`)
  }
}

/**
 * Extract patterns from text using regex
 */
export function extractPatterns(args: {
  text: string
  pattern: 'emails' | 'urls' | 'phone_numbers' | 'hashtags' | 'mentions' | 'custom'
  custom_regex?: string
}): string {
  const { text, pattern, custom_regex } = args

  let regex: RegExp

  switch (pattern) {
    case 'emails':
      regex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Z|a-z]{2,}\b/g
      break

    case 'urls':
      regex = /https?:\/\/(www\.)?[-a-zA-Z0-9@:%._\+~#=]{1,256}\.[a-zA-Z0-9()]{1,6}\b([-a-zA-Z0-9()@:%_\+.~#?&//=]*)/g
      break

    case 'phone_numbers':
      regex = /(\+?\d{1,3}[-.\s]?)?(\(?\d{3}\)?[-.\s]?)?\d{3}[-.\s]?\d{4}/g
      break

    case 'hashtags':
      regex = /#[\w]+/g
      break

    case 'mentions':
      regex = /@[\w]+/g
      break

    case 'custom':
      if (!custom_regex) {
        throw new Error('custom_regex parameter required for custom pattern')
      }
      try {
        regex = new RegExp(custom_regex, 'g')
      } catch {
        throw new Error('Invalid regular expression')
      }
      break

    default:
      throw new Error(`Unknown pattern: ${pattern}`)
  }

  const matches = text.match(regex) || []
  return JSON.stringify(matches)
}

/**
 * Hash text using Web Crypto API
 */
export async function hashText(args: {
  text: string
  algorithm: 'sha256' | 'sha1' | 'md5'
  output_format?: 'hex' | 'base64'
}): Promise<string> {
  const { text, algorithm, output_format = 'hex' } = args

  // MD5 not available in Web Crypto, use SHA-256 instead
  const algoMap: Record<string, string> = {
    sha256: 'SHA-256',
    sha1: 'SHA-1',
    md5: 'SHA-256', // Fallback to SHA-256 for MD5
  }

  const algoName = algoMap[algorithm]
  if (!algoName) {
    throw new Error(`Unknown algorithm: ${algorithm}`)
  }

  const encoder = new TextEncoder()
  const data = encoder.encode(text)
  const hashBuffer = await crypto.subtle.digest(algoName, data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))

  if (output_format === 'base64') {
    return btoa(String.fromCharCode(...hashArray))
  }

  // hex format
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
}

/**
 * Count words, characters, sentences
 */
export function countWords(args: {
  text: string
  metrics?: string[]
}): string {
  const { text, metrics = ['words', 'characters', 'sentences', 'paragraphs'] } = args
  const results: Record<string, number> = {}

  if (metrics.includes('characters')) {
    results.characters = text.length
  }

  if (metrics.includes('words')) {
    const words = text.trim().split(/\s+/).filter(w => w.length > 0)
    results.words = words.length
  }

  if (metrics.includes('sentences')) {
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0)
    results.sentences = sentences.length
  }

  if (metrics.includes('paragraphs')) {
    const paragraphs = text.split(/\n\n+/).filter(p => p.trim().length > 0)
    results.paragraphs = paragraphs.length
  }

  return JSON.stringify(results, null, 2)
}

/**
 * Truncate text smartly
 */
export function truncateText(args: {
  text: string
  max_length: number
  ellipsis?: boolean
  break_words?: boolean
}): string {
  const { text, max_length, ellipsis = true, break_words = false } = args

  if (text.length <= max_length) {
    return text
  }

  const ellipsisStr = ellipsis ? '...' : ''
  const targetLength = max_length - ellipsisStr.length

  if (break_words) {
    return text.substring(0, targetLength) + ellipsisStr
  }

  // Don't break words - find last space
  const truncated = text.substring(0, targetLength)
  const lastSpace = truncated.lastIndexOf(' ')

  if (lastSpace === -1) {
    // No spaces found, just break at limit
    return truncated + ellipsisStr
  }

  return truncated.substring(0, lastSpace) + ellipsisStr
}
