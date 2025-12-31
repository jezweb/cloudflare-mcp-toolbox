/**
 * Admin Session Management
 *
 * Handles session creation and validation for the admin dashboard.
 * Sessions are stored in KV with secure HTTP-only cookies.
 */

export interface AdminSession {
  id: string;
  email: string;
  name: string;
  picture?: string;
  expiresAt: number;
}

const SESSION_PREFIX = 'admin_session:';
const SESSION_TTL = 7 * 24 * 60 * 60; // 7 days in seconds
const COOKIE_NAME = '__Host-admin_session';

/**
 * Generate a secure session ID
 */
function generateSessionId(): string {
  const bytes = new Uint8Array(32);
  crypto.getRandomValues(bytes);
  return Array.from(bytes)
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Create a new admin session
 */
export async function createAdminSession(
  kv: KVNamespace,
  user: { email: string; name: string; picture?: string }
): Promise<{ session: AdminSession; setCookie: string }> {
  const session: AdminSession = {
    id: generateSessionId(),
    email: user.email,
    name: user.name,
    picture: user.picture,
    expiresAt: Date.now() + SESSION_TTL * 1000,
  };

  await kv.put(`${SESSION_PREFIX}${session.id}`, JSON.stringify(session), {
    expirationTtl: SESSION_TTL,
  });

  const setCookie = `${COOKIE_NAME}=${session.id}; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=${SESSION_TTL}`;

  return { session, setCookie };
}

/**
 * Get session from request cookie
 */
export async function getAdminSession(
  request: Request,
  kv: KVNamespace
): Promise<AdminSession | null> {
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (!match) return null;

  const sessionId = match[1];
  const data = await kv.get(`${SESSION_PREFIX}${sessionId}`);
  if (!data) return null;

  const session = JSON.parse(data) as AdminSession;

  // Check expiration
  if (session.expiresAt < Date.now()) {
    await kv.delete(`${SESSION_PREFIX}${sessionId}`);
    return null;
  }

  return session;
}

/**
 * Delete admin session (logout)
 */
export async function deleteAdminSession(
  request: Request,
  kv: KVNamespace
): Promise<string> {
  const cookies = request.headers.get('Cookie') || '';
  const match = cookies.match(new RegExp(`${COOKIE_NAME}=([^;]+)`));
  if (match) {
    await kv.delete(`${SESSION_PREFIX}${match[1]}`);
  }

  // Return clear cookie
  return `${COOKIE_NAME}=; Path=/; HttpOnly; Secure; SameSite=Lax; Max-Age=0`;
}
