import { prismaClient } from '@/configuration/prisma'
import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import { beneficiaireEnregistreDe } from '@/features/beneficiaire/implementations/prisma/beneficiaire-enregistre.transfer'
import type { LireLesBeneficiairesAFusionner } from '../../domain/ports'

const beneficiaireAFusionner = async (
  id: BeneficiaireId,
  mediateurId: MediateurId,
  maintenant: Date,
) => {
  const ligne = await prismaClient.beneficiaire.findFirst({
    where: {
      id,
      mediateurId,
      suppression: null,
      anonyme: false,
    },
  })
  return ligne === null ? null : beneficiaireEnregistreDe(ligne, maintenant)
}

export const lireLesBeneficiairesAFusionner: LireLesBeneficiairesAFusionner =
  async ({ sourceId, destinationId, mediateurId, maintenant }) => {
    const [source, destination] = await Promise.all([
      beneficiaireAFusionner(sourceId, mediateurId, maintenant),
      beneficiaireAFusionner(destinationId, mediateurId, maintenant),
    ])

    return { source, destination }
  }
