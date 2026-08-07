// Enums applicatifs (SQLite ne supporte pas les enums natifs Prisma - voir schema.prisma).

export enum Role {
  TRAVAILLEUR = 'TRAVAILLEUR',
  AGENCE = 'AGENCE',
  ADMIN = 'ADMIN',
}

export enum StatutAgrement {
  EN_ATTENTE = 'EN_ATTENTE',
  APPROUVE = 'APPROUVE',
  REJETE = 'REJETE',
}

export enum StatutVerificationIdentite {
  EN_ATTENTE = 'EN_ATTENTE',
  VERIFIE = 'VERIFIE',
  REJETE = 'REJETE',
}
