/**
 * KV Storage Utility Tools
 */

/**
 * Get value from KV
 */
export async function kvGet(args: { key: string; type?: 'text' | 'json' }, kv: KVNamespace): Promise<string> {
  const { key, type = 'text' } = args

  const value = type === 'json'
    ? await kv.get(key, 'json')
    : await kv.get(key, 'text')

  return JSON.stringify({
    found: value !== null,
    value,
  })
}

/**
 * Set value in KV
 */
export async function kvSet(
  args: { key: string; value: any; ttl?: number },
  kv: KVNamespace
): Promise<string> {
  const { key, value, ttl } = args

  const options: KVNamespacePutOptions = {}
  if (ttl) {
    options.expirationTtl = ttl
  }

  // Auto-detect if value should be JSON
  const stringValue = typeof value === 'string' ? value : JSON.stringify(value)

  await kv.put(key, stringValue, options)

  const result: any = {
    success: true,
    key,
  }

  if (ttl) {
    result.expires_at = Math.floor(Date.now() / 1000) + ttl
  }

  return JSON.stringify(result)
}

/**
 * Delete key from KV
 */
export async function kvDelete(args: { key: string }, kv: KVNamespace): Promise<string> {
  await kv.delete(args.key)

  return JSON.stringify({
    success: true,
    deleted: args.key,
  })
}

/**
 * List keys in KV
 */
export async function kvList(
  args: { prefix?: string; limit?: number },
  kv: KVNamespace
): Promise<string> {
  const { prefix, limit = 100 } = args

  const options: KVNamespaceListOptions = { limit }
  if (prefix) {
    options.prefix = prefix
  }

  const result = await kv.list(options)

  return JSON.stringify({
    keys: result.keys,
    count: result.keys.length,
    cursor: result.list_complete ? null : result.cursor,
  })
}
