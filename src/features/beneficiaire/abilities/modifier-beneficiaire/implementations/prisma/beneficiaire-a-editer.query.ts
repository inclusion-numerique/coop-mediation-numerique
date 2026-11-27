import { prismaClient } from '@/configuration/prisma'
import type { Prisma } from '@/generated/prisma/client'
import type { LireBeneficiaireAEditer } from '../../domain/ports'

const beneficiaireAEditerSelect = {
  id: true,
  mediateurId: true,
  prenom: true,
  nom: true,
  email: true,
  anneeNaissance: true,
  notes: true,
  genre: true,
  trancheAge: true,
  adresse: true,
  telephone: true,
  pasDeTelephone: true,
  statutSocial: true,
  commune: true,
  communeCodePostal: true,
  communeCodeInsee: true,
} satisfies Prisma.BeneficiaireSelect

export const beneficiaireAEditer: LireBeneficiaireAEditer = ({
  beneficiaireId,
  mediateurId,
}) =>
  prismaClient.beneficiaire.findUnique({
    where: {
      id: beneficiaireId,
      mediateurId,
      suppression: null,
    },
    select: beneficiaireAEditerSelect,
  })
