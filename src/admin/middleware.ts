/**
 * Admin Middleware
 *
 * Middleware for protecting admin routes with session validation.
 */

import type { Context, Next } from 'hono';
import { getAdminSession, type AdminSession } from './session';

interface AdminEnv {
  OAUTH_KV: KVNamespace;
  ADMIN_EMAILS?: string;
}

// Store session in a module-level variable (per-request)
let currentSession: AdminSession | null = null;

/**
 * Require admin session middleware
 * Checks for valid session and optionally restricts to allowed emails
 */
export function requireAdmin<E extends AdminEnv>() {
  return async (c: Context<{ Bindings: E }>, next: Next) => {
    const session = await getAdminSession(c.req.raw, c.env.OAUTH_KV);

    if (!session) {
      // Redirect to login for browser requests
      const accept = c.req.header('Accept') || '';
      if (accept.includes('text/html')) {
        return c.redirect('/admin/login');
      }
      return c.json({ error: 'Unauthorized' }, 401);
    }

    // Check if email is in allowed list (if configured)
    if (c.env.ADMIN_EMAILS) {
      const allowedEmails = c.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase());
      if (!allowedEmails.includes(session.email.toLowerCase())) {
        return c.json({ error: 'Forbidden: Email not authorized' }, 403);
      }
    }

    // Store session for retrieval
    currentSession = session;

    return next();
  };
}

/**
 * Get admin session from context (after requireAdmin middleware)
 */
export function getAdminFromContext<E extends AdminEnv>(_c: Context<{ Bindings: E }>): AdminSession | null {
  return currentSession;
}
