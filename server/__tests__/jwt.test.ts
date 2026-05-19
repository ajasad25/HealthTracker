process.env.JWT_SECRET = 'test-secret';
import { signToken, verifyToken } from '../lib/jwt';

test('sign then verify returns payload', () => {
  const t = signToken({ userId: 'u1', email: 'a@b.com' });
  const p = verifyToken(t);
  expect(p.userId).toBe('u1');
  expect(p.email).toBe('a@b.com');
});

test('invalid token throws', () => {
  expect(() => verifyToken('garbage')).toThrow();
});
