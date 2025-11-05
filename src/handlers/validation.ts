/**
 * Data Validation Utility Tools
 */

/**
 * Validate email address format
 */
export function validateEmail(args: { email: string }): string {
  const { email } = args
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

  if (!email || !emailRegex.test(email)) {
    return JSON.stringify({
      valid: false,
      error: 'Invalid email format',
    })
  }

  return JSON.stringify({
    valid: true,
    email,
  })
}

/**
 * Validate URL format
 */
export function validateUrl(args: {
  url: string
  require_protocol?: boolean
}): string {
  const { url, require_protocol = true } = args

  try {
    const parsed = new URL(url)

    if (require_protocol && !['http:', 'https:'].includes(parsed.protocol)) {
      return JSON.stringify({
        valid: false,
        error: 'URL must use http or https protocol',
      })
    }

    return JSON.stringify({
      valid: true,
      protocol: parsed.protocol.replace(':', ''),
      domain: parsed.hostname,
      path: parsed.pathname,
      query: parsed.search.replace('?', ''),
    })
  } catch {
    return JSON.stringify({
      valid: false,
      error: 'Invalid URL format',
    })
  }
}

/**
 * Validate phone number format
 */
export function validatePhone(args: {
  phone: string
  country_code?: string
}): string {
  const { phone, country_code } = args
  const cleaned = phone.replace(/[\s\-\(\)\.]/g, '')

  // Basic validation: starts with + and has 10-15 digits
  const phoneRegex = /^\+?\d{10,15}$/

  if (!phoneRegex.test(cleaned)) {
    return JSON.stringify({
      valid: false,
      error: 'Invalid phone number format',
    })
  }

  // Format with spaces for readability
  const formatted = cleaned.startsWith('+')
    ? `+${cleaned.slice(1, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 9)} ${cleaned.slice(9)}`
    : cleaned

  const result: any = {
    valid: true,
    formatted: formatted.trim(),
  }

  if (country_code) {
    result.country_code = country_code.toUpperCase()
  }

  return JSON.stringify(result)
}

/**
 * Validate JSON structure
 */
export function validateJson(args: { json_string: string }): string {
  try {
    const parsed = JSON.parse(args.json_string)
    return JSON.stringify({
      valid: true,
      parsed,
    })
  } catch (error) {
    return JSON.stringify({
      valid: false,
      error: error instanceof Error ? error.message : 'Invalid JSON',
    })
  }
}

/**
 * Sanitize HTML content
 */
export function sanitizeHtml(args: {
  html: string
  mode: 'strip' | 'escape'
}): string {
  const { html, mode } = args

  if (mode === 'strip') {
    // Remove all HTML tags
    return html.replace(/<[^>]*>/g, '')
  }

  if (mode === 'escape') {
    // Escape HTML entities
    return html
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
  }

  throw new Error(`Unknown mode: ${mode}`)
}

/**
 * Validate data against JSON schema
 */
export function validateSchema(args: {
  data: any
  schema: {
    type: string
    required?: string[]
    properties?: Record<string, any>
  }
}): string {
  const { data, schema } = args
  const errors: string[] = []

  // Check type
  const dataType = Array.isArray(data) ? 'array' : typeof data
  if (schema.type && dataType !== schema.type) {
    errors.push(`Expected type '${schema.type}', got '${dataType}'`)
  }

  // Check required fields (for objects)
  if (schema.type === 'object' && schema.required) {
    for (const field of schema.required) {
      if (!(field in data)) {
        errors.push(`Missing required field: ${field}`)
      }
    }
  }

  // Check property types (basic validation)
  if (schema.type === 'object' && schema.properties) {
    for (const [key, propSchema] of Object.entries(schema.properties)) {
      if (key in data) {
        const propType = Array.isArray(data[key]) ? 'array' : typeof data[key]
        if (propSchema.type && propType !== propSchema.type) {
          errors.push(`Field '${key}' must be type '${propSchema.type}'`)
        }

        // Check minimum (for numbers)
        if (propSchema.type === 'number' && propSchema.minimum !== undefined) {
          if (data[key] < propSchema.minimum) {
            errors.push(`Field '${key}' must be >= ${propSchema.minimum}`)
          }
        }
      }
    }
  }

  if (errors.length > 0) {
    return JSON.stringify({
      valid: false,
      errors,
    })
  }

  return JSON.stringify({
    valid: true,
  })
}
