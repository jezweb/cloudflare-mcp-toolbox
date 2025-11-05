/**
 * Workers AI Utility Tools
 */

/**
 * LLM chat inference
 */
export async function aiChat(
  args: {
    prompt: string
    system_message?: string
    max_tokens?: number
    model?: string
  },
  ai: Ai
): Promise<string> {
  const {
    prompt,
    system_message,
    max_tokens = 256,
    model = '@cf/meta/llama-3.1-8b-instruct',
  } = args

  const messages: any[] = []

  if (system_message) {
    messages.push({ role: 'system', content: system_message })
  }

  messages.push({ role: 'user', content: prompt })

  const response = await ai.run(model as any, {
    messages,
    max_tokens,
  }) as any

  return JSON.stringify({
    response: response.response || response.result?.response || 'No response',
    model,
    tokens_used: response.usage?.total_tokens || null,
  })
}

/**
 * Text classification / sentiment analysis
 */
export async function aiClassify(
  args: {
    text: string
    model?: string
  },
  ai: Ai
): Promise<string> {
  const { text, model = '@cf/huggingface/distilbert-sst-2-int8' } = args

  const response = await ai.run(model as any, {
    text,
  }) as any

  const result = Array.isArray(response) ? response[0] : response

  return JSON.stringify({
    classification: result.label || result.classification,
    score: result.score,
    model,
  })
}

/**
 * Text embeddings
 */
export async function aiEmbed(
  args: {
    text: string
    model?: string
  },
  ai: Ai,
  cache: KVNamespace
): Promise<string> {
  const { text, model = '@cf/baai/bge-base-en-v1.5' } = args

  // Check cache first (cache embeddings by hash of text)
  const encoder = new TextEncoder()
  const data = encoder.encode(text + model)
  const hashBuffer = await crypto.subtle.digest('SHA-256', data)
  const hashArray = Array.from(new Uint8Array(hashBuffer))
  const hash = hashArray.map(b => b.toString(16).padStart(2, '0')).join('')
  const cacheKey = `embed:${hash}`

  const cached = await cache.get(cacheKey, 'json')
  if (cached) {
    return JSON.stringify({
      ...(cached as object),
      cached: true,
    })
  }

  // Generate new embedding
  const response = await ai.run(model as any, {
    text,
  }) as any

  const embedding = response.data || response.embedding || response

  const result = {
    embedding: Array.isArray(embedding) ? embedding : embedding[0],
    dimensions: Array.isArray(embedding) ? embedding.length : embedding[0].length,
    model,
  }

  // Cache for 7 days
  await cache.put(cacheKey, JSON.stringify(result), { expirationTtl: 604800 })

  return JSON.stringify(result)
}
