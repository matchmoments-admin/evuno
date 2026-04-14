import { NextResponse } from 'next/server';
import { keycloakConfig, generatePKCE } from '../../../lib/auth';

export async function GET() {
  const { verifier, challenge } = await generatePKCE();
  const state = crypto.randomUUID();

  const authUrl = new URL(keycloakConfig.authorizationUrl);
  authUrl.searchParams.set('client_id', keycloakConfig.clientId);
  authUrl.searchParams.set('redirect_uri', keycloakConfig.callbackUrl);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', keycloakConfig.scope);
  authUrl.searchParams.set('code_challenge', challenge);
  authUrl.searchParams.set('code_challenge_method', 'S256');
  authUrl.searchParams.set('state', state);

  const response = NextResponse.redirect(authUrl);

  response.cookies.set('pkce_verifier', verifier, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });
  response.cookies.set('oauth_state', state, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 600,
  });

  return response;
}
