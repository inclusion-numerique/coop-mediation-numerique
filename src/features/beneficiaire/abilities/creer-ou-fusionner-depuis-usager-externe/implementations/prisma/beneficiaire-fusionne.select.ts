import type { Prisma } from '@/generated/prisma/client'

export const beneficiaireFusionneSelect = {
  id: true,
  prenom: true,
  nom: true,
  email: true,
  telephone: true,
  mediateurId: true,
  adresse: true,
  anneeNaissance: true,
  commune: true,
} satisfies Prisma.BeneficiaireSelect
