/**
 * OAuth utility functions for Google OAuth
 */

// Context from the auth process, encrypted & stored in the auth token
// and provided to the DurableMCP as this.props
export type Props = {
  id: string;      // Google user ID
  email: string;
  name: string;
  picture?: string;
  accessToken: string;
  refreshToken?: string;
  tokenExpiresAt?: number;
};

/**
 * Constructs an authorization URL for Google OAuth
 */
export function getUpstreamAuthorizeUrl({
  upstream_url,
  client_id,
  scope,
  redirect_uri,
  state,
}: {
  upstream_url: string;
  client_id: string;
  scope: string;
  redirect_uri: string;
  state?: string;
}) {
  const upstream = new URL(upstream_url);
  upstream.searchParams.set('client_id', client_id);
  upstream.searchParams.set('redirect_uri', redirect_uri);
  upstream.searchParams.set('scope', scope);
  if (state) upstream.searchParams.set('state', state);
  upstream.searchParams.set('response_type', 'code');
  upstream.searchParams.set('access_type', 'offline'); // For refresh tokens
  upstream.searchParams.set('prompt', 'consent'); // Always show consent screen
  return upstream.href;
}

/**
 * Token response from Google OAuth
 */
export interface GoogleTokenResponse {
  accessToken: string;
  refreshToken?: string;
  expiresAt: number;
}

/**
 * Fetches authorization tokens from Google
 *
 * @returns Tuple of [tokens, null] on success or [null, Response] on error
 */
export async function fetchUpstreamAuthToken({
  client_id,
  client_secret,
  code,
  redirect_uri,
  upstream_url,
}: {
  code: string | undefined;
  upstream_url: string;
  client_secret: string;
  redirect_uri: string;
  client_id: string;
}): Promise<[GoogleTokenResponse, null] | [null, Response]> {
  if (!code) {
    return [null, new Response('Missing code', { status: 400 })];
  }

  const resp = await fetch(upstream_url, {
    body: new URLSearchParams({
      client_id,
      client_secret,
      code,
      redirect_uri,
      grant_type: 'authorization_code',
    }).toString(),
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    method: 'POST',
  });

  if (!resp.ok) {
    const errorText = await resp.text();
    console.error('Google token exchange failed:', errorText);
    return [null, new Response('Failed to fetch access token', { status: 500 })];
  }

  const body = (await resp.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
    error?: string;
  };

  if (body.error) {
    console.error('Google OAuth error:', body.error);
    return [null, new Response(`OAuth error: ${body.error}`, { status: 400 })];
  }

  const accessToken = body.access_token;
  if (!accessToken) {
    return [null, new Response('Missing access token', { status: 400 })];
  }

  const expiresIn = body.expires_in || 3600;
  const expiresAt = Date.now() + (expiresIn * 1000);

  return [{
    accessToken,
    refreshToken: body.refresh_token,
    expiresAt,
  }, null];
}

/**
 * Refreshes an access token using a refresh token
 */
export async function refreshAccessToken({
  client_id,
  client_secret,
  refresh_token,
}: {
  client_id: string;
  client_secret: string;
  refresh_token: string;
}): Promise<GoogleTokenResponse | null> {
  const resp = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id,
      client_secret,
      refresh_token,
      grant_type: 'refresh_token',
    }).toString(),
  });

  if (!resp.ok) {
    console.error('Token refresh failed:', await resp.text());
    return null;
  }

  const body = (await resp.json()) as {
    access_token?: string;
    refresh_token?: string;
    expires_in?: number;
  };

  if (!body.access_token) return null;

  return {
    accessToken: body.access_token,
    refreshToken: body.refresh_token || refresh_token,
    expiresAt: Date.now() + ((body.expires_in || 3600) * 1000),
  };
}

/**
 * Fetches user info from Google
 */
export async function fetchGoogleUserInfo(accessToken: string): Promise<{
  id: string;
  email: string;
  name: string;
  picture?: string;
} | null> {
  const resp = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
    headers: {
      Authorization: `Bearer ${accessToken}`,
    },
  });

  if (!resp.ok) {
    console.error('Failed to fetch Google user info:', await resp.text());
    return null;
  }

  const user = await resp.json() as {
    id: string;
    email: string;
    name: string;
    picture?: string;
  };

  return user;
}
