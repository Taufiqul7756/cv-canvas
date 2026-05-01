import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY ?? '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY ?? '7d';

export interface AccessTokenPayload {
  id: number;
  role: 'USER' | 'ADMIN';
}

export interface RefreshTokenPayload {
  id: number;
}

export const signAccessToken = (payload: AccessTokenPayload): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRY } as jwt.SignOptions);

export const signRefreshToken = (payload: RefreshTokenPayload): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: REFRESH_EXPIRY } as jwt.SignOptions);

export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, JWT_SECRET) as AccessTokenPayload;

export const verifyRefreshToken = (token: string): RefreshTokenPayload =>
  jwt.verify(token, JWT_SECRET) as RefreshTokenPayload;
