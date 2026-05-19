import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const email = 'test@healthtracker.dev';
  const password_hash = await bcrypt.hash('test1234', 10);
  await prisma.user.upsert({
    where: { email },
    update: { password_hash, name: 'Test User' },
    create: { email, password_hash, name: 'Test User' },
  });
  console.log(`Seeded user: ${email} / test1234`);
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (e) => {
    console.error(e);
    await prisma.$disconnect();
    process.exit(1);
  });
