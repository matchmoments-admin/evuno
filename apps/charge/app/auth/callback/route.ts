import { NextRequest, NextResponse } from 'next/server';
import { cookies } from 'next/headers';
import { keycloakConfig } from '../../../lib/auth';

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const code = searchParams.get('code');
  const state = searchParams.get('state');
  const error = searchParams.get('error');

  if (error) {
    return NextResponse.redirect(new URL('/en?error=auth_failed', request.url));
  }

  if (!code) {
    return NextResponse.redirect(new URL('/en?error=no_code', request.url));
  }

  const cookieStore = cookies();
  const codeVerifier = cookieStore.get('pkce_verifier')?.value;
  const savedState = cookieStore.get('oauth_state')?.value;

  if (!codeVerifier || state !== savedState) {
    return NextResponse.redirect(new URL('/en?error=invalid_state', request.url));
  }

  // Exchange authorisation code for tokens
  const tokenResponse = await fetch(keycloakConfig.tokenUrl, {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      grant_type: 'authorization_code',
      client_id: keycloakConfig.clientId,
      code,
      redirect_uri: keycloakConfig.callbackUrl,
      code_verifier: codeVerifier,
    }),
  });

  if (!tokenResponse.ok) {
    return NextResponse.redirect(new URL('/en?error=token_exchange_failed', request.url));
  }

  const tokens = (await tokenResponse.json()) as {
    access_token: string;
    refresh_token: string;
    expires_in: number;
  };

  const response = NextResponse.redirect(new URL('/en/dashboard', request.url));

  response.cookies.set('access_token', tokens.access_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: tokens.expires_in,
  });

  response.cookies.set('refresh_token', tokens.refresh_token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 30 * 24 * 60 * 60,
  });

  // Clear PKCE cookies
  response.cookies.delete('pkce_verifier');
  response.cookies.delete('oauth_state');

  return response;
}
