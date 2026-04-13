import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Strategy, ExtractJwt } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'keycloak') {
  constructor() {
    const keycloakUrl = process.env.KEYCLOAK_URL ?? 'http://localhost:8080';
    const realm = process.env.KEYCLOAK_REALM ?? 'evuno';

    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 10,
        jwksUri: `${keycloakUrl}/realms/${realm}/protocol/openid-connect/certs`,
      }),
      issuer: `${keycloakUrl}/realms/${realm}`,
      algorithms: ['RS256'],
    });
  }

  validate(payload: Record<string, unknown>) {
    // Extract roles from Keycloak token
    const realmRoles =
      (payload.realm_access as { roles?: string[] })?.roles ?? [];
    const clientRoles =
      (payload.resource_access as Record<string, { roles?: string[] }>) ?? {};

    // Extract tenant_id from Keycloak group membership
    // The realm-export.json maps group attributes to a tenant_id claim
    const tenantId = payload.tenant_id as string | undefined;

    return {
      sub: payload.sub as string,
      email: payload.email as string,
      name: payload.name as string,
      roles: realmRoles,
      clientRoles,
      tenantId,
    };
  }
}
