import { prismaClient } from '@/configuration/prisma'
import { beneficiaireEnregistreDe } from '@/features/beneficiaire/implementations/prisma/beneficiaire-enregistre.transfer'
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

export const beneficiaireAEditer: LireBeneficiaireAEditer = async ({
  beneficiaireId,
  mediateurId,
  maintenant,
}) => {
  const ligne = await prismaClient.beneficiaire.findUnique({
    where: {
      id: beneficiaireId,
      mediateurId,
      suppression: null,
    },
    select: beneficiaireAEditerSelect,
  })
  return ligne === null ? null : beneficiaireEnregistreDe(ligne, maintenant)
}
