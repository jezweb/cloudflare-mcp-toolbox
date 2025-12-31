/**
 * Admin Routes
 *
 * API routes for the admin dashboard.
 */

import { Hono } from 'hono';
import { requireAdmin, getAdminFromContext } from './middleware';
import { getAdminSession, deleteAdminSession, createAdminSession } from './session';
import {
  createAuthToken,
  listAuthTokens,
  deleteAuthToken,
  maskToken,
} from './tokens';
import { renderAdminDashboard } from './ui';

// Server info for dashboard display
const SERVER_INFO = {
  name: 'cloudflare-mcp-toolbox',
  version: '1.0.0',
  description: '30 utility tools for AI agents - datetime, math, text, validation, KV storage, Workers AI',
};

// MCP capabilities (for dashboard display)
const TOOLS = [
  // Date/Time Tools (5)
  { name: 'get_current_datetime', description: 'Get current date and time in specified timezone' },
  { name: 'convert_timezone', description: 'Convert datetime from one timezone to another' },
  { name: 'calculate_duration', description: 'Calculate time difference between two dates' },
  { name: 'format_date', description: 'Format date in various styles' },
  { name: 'parse_date', description: 'Parse natural language date expressions' },
  // Math Tools (6)
  { name: 'calculate', description: 'Safely evaluate mathematical expressions' },
  { name: 'convert_units', description: 'Convert between units of measurement' },
  { name: 'statistics', description: 'Calculate statistical measures on arrays' },
  { name: 'random_number', description: 'Generate cryptographically secure random numbers' },
  { name: 'percentage', description: 'Calculate percentages and percentage changes' },
  { name: 'roll_dice', description: 'Roll dice using standard notation' },
  // Text Tools (6)
  { name: 'transform_text', description: 'Transform text (uppercase, lowercase, slug, etc.)' },
  { name: 'encode_decode', description: 'Encode or decode text (base64, URL, HTML)' },
  { name: 'extract_patterns', description: 'Extract patterns from text (emails, URLs, etc.)' },
  { name: 'hash_text', description: 'Hash text using SHA-256, SHA-1, or MD5' },
  { name: 'count_words', description: 'Count words, characters, sentences, paragraphs' },
  { name: 'truncate_text', description: 'Truncate text with ellipsis and word boundaries' },
  // Validation Tools (6)
  { name: 'validate_email', description: 'Validate email address format' },
  { name: 'validate_url', description: 'Validate URL format and parse components' },
  { name: 'validate_phone', description: 'Validate phone number format' },
  { name: 'validate_json', description: 'Validate JSON string and parse it' },
  { name: 'sanitize_html', description: 'Sanitize HTML by stripping or escaping' },
  { name: 'validate_schema', description: 'Validate data against a simple JSON schema' },
  // KV Storage Tools (4)
  { name: 'kv_get', description: 'Get value from Cloudflare KV storage' },
  { name: 'kv_set', description: 'Set value in Cloudflare KV storage with optional TTL' },
  { name: 'kv_delete', description: 'Delete key from Cloudflare KV storage' },
  { name: 'kv_list', description: 'List keys in Cloudflare KV storage' },
  // Workers AI Tools (3)
  { name: 'ai_chat', description: 'Generate text using Cloudflare Workers AI LLM' },
  { name: 'ai_classify', description: 'Classify text or perform sentiment analysis' },
  { name: 'ai_embed', description: 'Generate text embeddings (cached for efficiency)' },
];

const RESOURCES: { name: string; description: string }[] = [];
const PROMPTS: { name: string; description: string }[] = [];

// Admin environment interface
interface AdminEnv {
  OAUTH_KV: KVNamespace;
  ADMIN_EMAILS?: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
}

const app = new Hono<{ Bindings: AdminEnv }>();

// ============ Admin OAuth Routes ============

// GET /admin/login - Start Google OAuth flow for admin
app.get('/admin/login', async (c) => {
  const state = crypto.randomUUID();

  // Store state in KV for validation
  await c.env.OAUTH_KV.put(`admin_oauth_state:${state}`, 'pending', {
    expirationTtl: 600, // 10 minutes
  });

  const params = new URLSearchParams({
    client_id: c.env.GOOGLE_CLIENT_ID,
    redirect_uri: new URL('/admin/callback', c.req.url).href,
    response_type: 'code',
    scope: 'openid email profile',
    state,
    access_type: 'offline',
    prompt: 'consent',
  });

  return c.redirect(`https://accounts.google.com/o/oauth2/v2/auth?${params}`);
});

// GET /admin/callback - Handle Google OAuth callback
app.get('/admin/callback', async (c) => {
  const code = c.req.query('code');
  const state = c.req.query('state');
  const error = c.req.query('error');

  if (error) {
    return c.text(`OAuth error: ${error}`, 400);
  }

  if (!code || !state) {
    return c.text('Missing code or state', 400);
  }

  // Validate state
  const storedState = await c.env.OAUTH_KV.get(`admin_oauth_state:${state}`);
  if (!storedState) {
    return c.text('Invalid or expired state', 400);
  }

  // Clean up state
  await c.env.OAUTH_KV.delete(`admin_oauth_state:${state}`);

  // Exchange code for tokens
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: c.env.GOOGLE_CLIENT_ID,
      client_secret: c.env.GOOGLE_CLIENT_SECRET,
      code,
      grant_type: 'authorization_code',
      redirect_uri: new URL('/admin/callback', c.req.url).href,
    }),
  });

  if (!tokenResponse.ok) {
    const errorText = await tokenResponse.text();
    console.error('Token exchange failed:', errorText);
    return c.text('Failed to exchange code for token', 500);
  }

  const tokens = (await tokenResponse.json()) as {
    access_token: string;
    refresh_token?: string;
    expires_in: number;
  };

  // Get user info
  const userResponse = await fetch(
    'https://www.googleapis.com/oauth2/v2/userinfo',
    {
      headers: { Authorization: `Bearer ${tokens.access_token}` },
    }
  );

  if (!userResponse.ok) {
    return c.text('Failed to get user info', 500);
  }

  const user = (await userResponse.json()) as {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };

  // Check if user is allowed (if ADMIN_EMAILS is configured)
  if (c.env.ADMIN_EMAILS) {
    const allowedEmails = c.env.ADMIN_EMAILS.split(',').map((e) => e.trim().toLowerCase());
    if (!allowedEmails.includes(user.email.toLowerCase())) {
      return c.text(`Access denied: ${user.email} is not authorized`, 403);
    }
  }

  // Create admin session
  const { setCookie } = await createAdminSession(c.env.OAUTH_KV, {
    email: user.email,
    name: user.name,
    picture: user.picture,
  });

  // Redirect to admin dashboard
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/admin',
      'Set-Cookie': setCookie,
    },
  });
});

// ============ Admin Dashboard ============

// GET /admin - Dashboard page
app.get('/admin', requireAdmin(), async (c) => {
  const session = getAdminFromContext(c);
  const tokens = await listAuthTokens(c.env.OAUTH_KV);

  const maskedTokens = tokens.map((t) => ({
    ...t,
    token: maskToken(t.token),
  }));

  return c.html(
    renderAdminDashboard({
      user: session!,
      tokens: maskedTokens,
      server: SERVER_INFO,
      tools: TOOLS,
      resources: RESOURCES,
      prompts: PROMPTS,
    })
  );
});

// GET /admin/logout - Logout
app.get('/admin/logout', async (c) => {
  const clearCookie = await deleteAdminSession(c.req.raw, c.env.OAUTH_KV);

  return new Response(null, {
    status: 302,
    headers: {
      Location: '/',
      'Set-Cookie': clearCookie,
    },
  });
});

// ============ Token API Routes ============

// GET /api/admin/tokens - List all tokens
app.get('/api/admin/tokens', requireAdmin(), async (c) => {
  const tokens = await listAuthTokens(c.env.OAUTH_KV);
  const maskedTokens = tokens.map((t) => ({
    ...t,
    token: maskToken(t.token),
  }));
  return c.json({ tokens: maskedTokens });
});

// POST /api/admin/tokens - Create new token
app.post('/api/admin/tokens', requireAdmin(), async (c) => {
  const body = await c.req.json<{ label: string }>();

  if (!body.label || typeof body.label !== 'string') {
    return c.json({ error: 'Label is required' }, 400);
  }

  const session = getAdminFromContext(c);
  const token = await createAuthToken(c.env.OAUTH_KV, body.label, session!.email);

  return c.json({
    token: {
      id: token.id,
      label: token.label,
      token: token.token, // Return full token only on creation
      createdAt: token.createdAt,
      createdBy: token.createdBy,
    },
  });
});

// DELETE /api/admin/tokens/:id - Delete a token
app.delete('/api/admin/tokens/:id', requireAdmin(), async (c) => {
  const { id } = c.req.param();
  const deleted = await deleteAuthToken(c.env.OAUTH_KV, id);

  if (!deleted) {
    return c.json({ error: 'Token not found' }, 404);
  }

  return c.json({ success: true });
});

// ============ Session API Routes ============

// GET /api/auth/session - Get current session
app.get('/api/auth/session', async (c) => {
  const session = await getAdminSession(c.req.raw, c.env.OAUTH_KV);

  if (!session) {
    return c.json({ authenticated: false });
  }

  return c.json({
    authenticated: true,
    user: {
      email: session.email,
      name: session.name,
      picture: session.picture,
    },
  });
});

export { app as adminApp };
