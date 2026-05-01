import { Request, Response, NextFunction } from 'express';
import { createUser, findByEmail, findById } from '../models/auth.model';
import { signAccessToken, signRefreshToken, verifyRefreshToken } from '../utils/jwt';
import { comparePassword } from '../utils/password';
import { setAuthCookies, clearAuthCookies } from '../utils/cookie';
import { redis } from '../redis';
import { ValidationError, AuthError } from '../utils/errors';
import { RegisterInput, LoginInput } from '../validators/auth.validator';

const blacklistRefreshToken = async (token: string): Promise<void> => {
  try {
    const payload = verifyRefreshToken(token);
    const ttl = payload.exp
      ? Math.max(payload.exp - Math.floor(Date.now() / 1000), 1)
      : 7 * 24 * 60 * 60;
    await redis.setex(`refresh:blacklist:${payload.jti}`, ttl, '1');
  } catch {
    // Token already expired or invalid — no need to blacklist
  }
};

export const register = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = req.body as RegisterInput;

    const existing = await findByEmail(data.email);
    if (existing) {
      throw new ValidationError('email_exists', 'A user with this email already exists.', 'email');
    }

    const user = await createUser(data);
    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id });
    setAuthCookies(res, accessToken, refreshToken);
    res.status(201).json(user);
  } catch (err) {
    next(err);
  }
};

export const login = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const data = req.body as LoginInput;

    const user = await findByEmail(data.email);
    if (!user) {
      throw new AuthError('invalid_credentials', 'Invalid email or password.');
    }

    const passwordMatch = await comparePassword(data.password, user.password);
    if (!passwordMatch) {
      throw new AuthError('invalid_credentials', 'Invalid email or password.');
    }

    if (user.is_deleted || !user.is_active) {
      throw new AuthError('account_disabled', 'This account has been disabled.');
    }

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id });
    setAuthCookies(res, accessToken, refreshToken);

    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const { password: _pw, ...userWithoutPassword } = user;
    res.json(userWithoutPassword);
  } catch (err) {
    next(err);
  }
};

export const refresh = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies.refresh_token as string | undefined;
    if (!token) {
      throw new AuthError('no_refresh_token', 'Refresh token is required.');
    }

    let payload;
    try {
      payload = verifyRefreshToken(token);
    } catch {
      throw new AuthError('token_not_valid', 'Token is invalid or expired.');
    }

    const blacklisted = await redis.get(`refresh:blacklist:${payload.jti}`);
    if (blacklisted) {
      throw new AuthError('refresh_revoked', 'Refresh token has been revoked.');
    }

    const user = await findById(payload.id);
    if (!user || !user.is_active) {
      throw new AuthError('account_disabled', 'Account is disabled or not found.');
    }

    // Rotate: blacklist the consumed token before issuing a new one
    const ttl = payload.exp
      ? Math.max(payload.exp - Math.floor(Date.now() / 1000), 1)
      : 7 * 24 * 60 * 60;
    await redis.setex(`refresh:blacklist:${payload.jti}`, ttl, '1');

    const accessToken = signAccessToken({ id: user.id, role: user.role });
    const refreshToken = signRefreshToken({ id: user.id });
    setAuthCookies(res, accessToken, refreshToken);
    res.json(user);
  } catch (err) {
    next(err);
  }
};

export const logout = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const token = req.cookies.refresh_token as string | undefined;
    if (token) {
      await blacklistRefreshToken(token);
    }
    clearAuthCookies(res);
    res.status(204).send();
  } catch (err) {
    next(err);
  }
};

export const me = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      throw new AuthError('not_authenticated', 'Authentication required.');
    }

    const user = await findById(req.user.id);
    if (!user) {
      throw new AuthError('not_authenticated', 'User not found or has been deleted.');
    }

    res.json(user);
  } catch (err) {
    next(err);
  }
};
