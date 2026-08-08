import { PrismaClient } from '@prisma/client';
import * as bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';
import { Role } from '../src/common/enums';

const prisma = new PrismaClient();

/**
 * Genere un mot de passe aleatoire lisible (evite les caracteres ambigus).
 * N'est jamais stocke en clair : uniquement affiche une fois dans la console
 * pour que l'operateur puisse se connecter et le changer immediatement.
 */
function genererMotDePasseAleatoire(): string {
  const alphabet = 'ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnpqrstuvwxyz23456789!@#%';
  const octets = randomBytes(16);
  return Array.from(octets, (b) => alphabet[b % alphabet.length]).join('');
}

async function main() {
  const email = process.env.ADMIN_EMAIL || 'ministere@pndfe.ci';

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) {
    console.log(`Compte admin deja present: ${email}`);
    return;
  }

  // ADMIN_PASSWORD doit etre fourni explicitement en production. Sans cette
  // variable, un mot de passe aleatoire est genere et affiche une seule
  // fois : a noter immediatement et a changer des la premiere connexion.
  const motDePasseFourni = process.env.ADMIN_PASSWORD;
  const password = motDePasseFourni || genererMotDePasseAleatoire();

  const passwordHash = await bcrypt.hash(password, 10);
  await prisma.user.create({
    data: { email, passwordHash, role: Role.ADMIN },
  });

  console.log('Compte administrateur (Ministere) cree :');
  console.log(`  email    : ${email}`);
  if (motDePasseFourni) {
    console.log('  password : (defini via ADMIN_PASSWORD)');
  } else {
    console.log(`  password : ${password}`);
    console.log('  -> Mot de passe genere aleatoirement, affiche une seule fois.');
    console.log('  -> Notez-le maintenant et changez-le des la premiere connexion.');
  }
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
