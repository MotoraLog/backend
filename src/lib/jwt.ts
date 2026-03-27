import { SignJWT, jwtVerify } from 'jose';

import { getEnv } from '@/lib/env';

type TokenType = 'access' | 'refresh';

export type TokenPayload = {
  sub: string;
  email: string;
  type: TokenType;
};

function getSecret() {
  return new TextEncoder().encode(getEnv().jwtSecret);
}

export async function signAccessToken(payload: Omit<TokenPayload, 'type'>) {
  return new SignJWT({ ...payload, type: 'access' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${getEnv().accessTokenTtlMinutes}m`)
    .sign(getSecret());
}

export async function signRefreshToken(payload: Omit<TokenPayload, 'type'>) {
  return new SignJWT({ ...payload, type: 'refresh' })
    .setProtectedHeader({ alg: 'HS256' })
    .setSubject(payload.sub)
    .setIssuedAt()
    .setExpirationTime(`${getEnv().refreshTokenTtlDays}d`)
    .sign(getSecret());
}

export async function verifyToken(token: string) {
  const { payload } = await jwtVerify(token, getSecret());
  return payload as unknown as TokenPayload;
}
