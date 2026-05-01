import { Request, Response, NextFunction } from 'express';
import { verifyAccessToken } from '../utils/jwt';

export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  const token = req.cookies.access_token as string | undefined;
  if (!token) {
    res.status(401).json({
      type: 'auth_error',
      errors: [{ code: 'not_authenticated', detail: 'Authentication required.' }],
    });
    return;
  }

  try {
    const decoded = verifyAccessToken(token);
    req.user = decoded;
    next();
  } catch {
    res.status(401).json({
      type: 'auth_error',
      errors: [{ code: 'token_not_valid', detail: 'Token is invalid or expired.' }],
    });
  }
};
