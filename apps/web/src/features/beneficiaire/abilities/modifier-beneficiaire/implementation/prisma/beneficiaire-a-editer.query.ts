import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'
import type { LireBeneficiaireAEditer } from '../../domain/beneficiaire-a-editer'

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
      // Seul le médiateur propriétaire peut éditer la fiche.
      mediateurId,
      suppression: null,
    },
    select: beneficiaireAEditerSelect,
  })
