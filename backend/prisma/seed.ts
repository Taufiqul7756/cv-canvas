import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const db = new PrismaClient();

async function main() {
  const email = process.env.ADMIN_EMAIL;
  const password = process.env.ADMIN_PASSWORD;

  if (!email || !password) {
    console.error('ADMIN_EMAIL and ADMIN_PASSWORD env vars must be set');
    process.exit(1);
  }

  const existing = await db.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Admin user already exists (${email}), skipping.`);
    return;
  }

  const hashed = await bcrypt.hash(password, 12);
  await db.user.create({
    data: {
      email,
      password: hashed,
      full_name: 'Admin',
      role: 'ADMIN',
      email_verified: true,
    },
  });

  console.log(`Admin user created: ${email}`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => db.$disconnect());
