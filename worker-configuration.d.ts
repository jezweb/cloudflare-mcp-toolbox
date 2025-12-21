/**
 * Worker Configuration Types
 * Auto-generated bindings for Cloudflare Worker
 */

interface Env {
  // KV namespace for caching (existing)
  CACHE: KVNamespace;

  // KV namespace for OAuth state management
  OAUTH_KV: KVNamespace;

  // Workers AI for chat, classification, embeddings
  AI: Ai;

  // Durable Objects for MCP session management
  MCP_OBJECT: DurableObjectNamespace;

  // Secrets (set via wrangler secret put)
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  COOKIE_ENCRYPTION_KEY: string;
  AUTH_TOKEN: string;
}
