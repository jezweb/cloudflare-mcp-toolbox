/**
 * Auth Token Management
 *
 * Handles creation, listing, and deletion of auth tokens for programmatic access.
 * Tokens are stored in KV with O(1) lookup by value.
 */

export interface AuthToken {
  id: string;
  label: string;
  token: string;
  createdAt: number;
  createdBy: string;
}

const TOKEN_PREFIX = 'auth_token:';
const TOKEN_VALUE_PREFIX = 'auth_token_value:';
const TOKEN_LIST_KEY = 'auth_tokens_list';

/**
 * Generate a secure token
 */
function generateToken(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Generate a short ID
 */
function generateId(): string {
  const bytes = new Uint8Array(8);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Create a new auth token
 */
export async function createAuthToken(
  kv: KVNamespace,
  label: string,
  createdBy: string
): Promise<AuthToken> {
  const token: AuthToken = {
    id: generateId(),
    label,
    token: generateToken(),
    createdAt: Date.now(),
    createdBy,
  };

  // Store token by ID
  await kv.put(`${TOKEN_PREFIX}${token.id}`, JSON.stringify(token));

  // Store reverse lookup by token value (for O(1) validation)
  await kv.put(`${TOKEN_VALUE_PREFIX}${token.token}`, token.id);

  // Update token list
  const list = await getTokenList(kv);
  list.push(token.id);
  await kv.put(TOKEN_LIST_KEY, JSON.stringify(list));

  return token;
}

/**
 * List all auth tokens
 */
export async function listAuthTokens(kv: KVNamespace): Promise<AuthToken[]> {
  const list = await getTokenList(kv);
  const tokens: AuthToken[] = [];

  for (const id of list) {
    const data = await kv.get(`${TOKEN_PREFIX}${id}`);
    if (data) {
      tokens.push(JSON.parse(data));
    }
  }

  return tokens.sort((a, b) => b.createdAt - a.createdAt);
}

/**
 * Delete an auth token
 */
export async function deleteAuthToken(
  kv: KVNamespace,
  id: string
): Promise<boolean> {
  const data = await kv.get(`${TOKEN_PREFIX}${id}`);
  if (!data) return false;

  const token = JSON.parse(data) as AuthToken;

  // Delete token and reverse lookup
  await kv.delete(`${TOKEN_PREFIX}${id}`);
  await kv.delete(`${TOKEN_VALUE_PREFIX}${token.token}`);

  // Update list
  const list = await getTokenList(kv);
  const newList = list.filter((tid) => tid !== id);
  await kv.put(TOKEN_LIST_KEY, JSON.stringify(newList));

  return true;
}

/**
 * Validate a token value and return the token info if valid
 */
export async function validateToken(
  kv: KVNamespace,
  tokenValue: string
): Promise<AuthToken | null> {
  // O(1) lookup by token value
  const tokenId = await kv.get(`${TOKEN_VALUE_PREFIX}${tokenValue}`);
  if (!tokenId) return null;

  const data = await kv.get(`${TOKEN_PREFIX}${tokenId}`);
  if (!data) return null;

  return JSON.parse(data) as AuthToken;
}

/**
 * Mask a token for display
 */
export function maskToken(token: string): string {
  if (token.length <= 8) return '********';
  return token.slice(0, 4) + '...' + token.slice(-4);
}

/**
 * Get token ID list from KV
 */
async function getTokenList(kv: KVNamespace): Promise<string[]> {
  const data = await kv.get(TOKEN_LIST_KEY);
  if (!data) return [];
  return JSON.parse(data);
}
