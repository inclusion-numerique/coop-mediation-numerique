import { prismaClient } from '@/configuration/prisma'
import type { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { MediateurId } from '@/features/beneficiaire/domain/mediateur-id'
import type { LireLesBeneficiairesAFusionner } from '../../domain/fusionner-beneficiaires'

const beneficiaireAFusionner = (id: BeneficiaireId, mediateurId: MediateurId) =>
  prismaClient.beneficiaire.findFirst({
    where: {
      id,
      mediateurId,
      suppression: null,
      anonyme: false,
    },
  })

export const lireLesBeneficiairesAFusionner: LireLesBeneficiairesAFusionner =
  async ({ sourceId, destinationId, mediateurId }) => {
    const [source, destination] = await Promise.all([
      beneficiaireAFusionner(sourceId, mediateurId),
      beneficiaireAFusionner(destinationId, mediateurId),
    ])

    return { source, destination }
  }
