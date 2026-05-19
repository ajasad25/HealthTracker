import { NextRequest } from 'next/server';
import { verifyToken, JwtPayload } from './jwt';

export class AuthError extends Error {}

export function requireAuth(req: NextRequest): JwtPayload {
  const h = req.headers.get('authorization') ?? '';
  const m = h.match(/^Bearer (.+)$/);
  if (!m) throw new AuthError('Missing token');
  try {
    return verifyToken(m[1]);
  } catch {
    throw new AuthError('Invalid token');
  }
}
