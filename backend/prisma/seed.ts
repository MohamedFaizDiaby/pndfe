import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { Role } from '../src/common/enums';

const prisma = new PrismaClient();

async function main() {
  const email = 'ministere@pndfe.ci';
  const password = 'Admin123!';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Compte admin deja present: ${email}`);
    return;
  }

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, passwordHash, role: Role.ADMIN },
  });

  console.log('Compte administrateur (Ministere) cree:');
  console.log(`  email    : ${email}`);
  console.log(`  password : ${password}`);
  console.log('  -> A changer immediatement en production.');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
