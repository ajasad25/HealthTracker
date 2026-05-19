import { hashPassword, verifyPassword } from '../lib/password';

test('hash then verify round-trips', async () => {
  const h = await hashPassword('secret123');
  expect(h).not.toBe('secret123');
  expect(await verifyPassword('secret123', h)).toBe(true);
  expect(await verifyPassword('wrong', h)).toBe(false);
});
