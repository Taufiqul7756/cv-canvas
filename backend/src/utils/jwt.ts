import crypto from 'crypto';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET ?? 'dev-secret-change-me';
const ACCESS_EXPIRY = process.env.JWT_ACCESS_EXPIRY ?? '15m';
const REFRESH_EXPIRY = process.env.JWT_REFRESH_EXPIRY ?? '7d';

export interface AccessTokenPayload {
  id: number;
  role: 'USER' | 'ADMIN';
  exp?: number;
  iat?: number;
}

export interface RefreshTokenPayload {
  id: number;
  jti: string;
  exp?: number;
  iat?: number;
}

export const signAccessToken = (payload: Omit<AccessTokenPayload, 'exp' | 'iat'>): string =>
  jwt.sign(payload, JWT_SECRET, { expiresIn: ACCESS_EXPIRY } as jwt.SignOptions);

export const signRefreshToken = (payload: Omit<RefreshTokenPayload, 'jti' | 'exp' | 'iat'>): string => {
  const jti = crypto.randomUUID();
  return jwt.sign({ ...payload, jti }, JWT_SECRET, { expiresIn: REFRESH_EXPIRY } as jwt.SignOptions);
};

export const verifyAccessToken = (token: string): AccessTokenPayload =>
  jwt.verify(token, JWT_SECRET) as AccessTokenPayload;

export const verifyRefreshToken = (token: string): RefreshTokenPayload =>
  jwt.verify(token, JWT_SECRET) as RefreshTokenPayload;
