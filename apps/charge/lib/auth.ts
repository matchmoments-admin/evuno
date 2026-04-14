const KEYCLOAK_URL = process.env.KEYCLOAK_URL ?? 'http://localhost:8080';
const REALM = process.env.KEYCLOAK_REALM ?? 'evuno';
const CLIENT_ID = process.env.KEYCLOAK_CLIENT_ID ?? 'evuno-charge';

export const keycloakConfig = {
  issuer: `${KEYCLOAK_URL}/realms/${REALM}`,
  authorizationUrl: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/auth`,
  tokenUrl: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/token`,
  userinfoUrl: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/userinfo`,
  endSessionUrl: `${KEYCLOAK_URL}/realms/${REALM}/protocol/openid-connect/logout`,
  clientId: CLIENT_ID,
  callbackUrl: process.env.NEXT_PUBLIC_APP_URL
    ? `${process.env.NEXT_PUBLIC_APP_URL}/auth/callback`
    : 'http://localhost:3000/auth/callback',
  scope: 'openid profile email',
};

/**
 * Generate PKCE code verifier and challenge
 */
export async function generatePKCE() {
  const array = new Uint8Array(32);
  crypto.getRandomValues(array);
  const verifier = btoa(String.fromCharCode(...array))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const hash = await crypto.subtle.digest('SHA-256', data);
  const challenge = btoa(String.fromCharCode(...new Uint8Array(hash)))
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  return { verifier, challenge };
}
