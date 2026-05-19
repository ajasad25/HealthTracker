import jwt from 'jsonwebtoken';

export interface JwtPayload {
  userId: string;
  email: string;
}

function secret(): string {
  const s = process.env.JWT_SECRET;
  if (!s) throw new Error('JWT_SECRET not set');
  return s;
}

export const signToken = (p: JwtPayload) =>
  jwt.sign(p, secret(), { expiresIn: '7d' });

export const verifyToken = (t: string): JwtPayload => {
  const decoded = jwt.verify(t, secret()) as jwt.JwtPayload;
  return { userId: decoded.userId, email: decoded.email };
};
