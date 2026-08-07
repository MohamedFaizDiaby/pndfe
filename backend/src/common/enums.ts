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

export enum StatutContrat {
  ENVOYE = 'ENVOYE',
  SIGNE = 'SIGNE',
  REFUSE = 'REFUSE',
}

export enum MethodePaiement {
  ORANGE_MONEY = 'ORANGE_MONEY',
  MTN_MOMO = 'MTN_MOMO',
}

export enum StatutPaiement {
  REUSSI = 'REUSSI',
  ECHEC = 'ECHEC',
}

// Taux appliques en simulation, indicatifs (a aligner sur le bareme officiel CNPS/CMU en production).
export const TAUX_COTISATION_CNPS = 0.063; // 6.3% du salaire brut (part salariale retraite)
export const MONTANT_COTISATION_CMU = 1000; // forfait mensuel CMU en FCFA
