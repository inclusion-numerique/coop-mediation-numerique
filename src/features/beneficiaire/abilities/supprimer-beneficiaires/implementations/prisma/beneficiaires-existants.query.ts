import { prismaClient } from '@/configuration/prisma'
import { BeneficiaireId } from '@/features/beneficiaire/domain/beneficiaire-id'
import type { BeneficiairesExistants } from '../../domain/supprimer-beneficiaires'

export const beneficiairesExistants: BeneficiairesExistants = async ({
  ids,
  mediateurId,
}) => {
  const beneficiaires = await prismaClient.beneficiaire.findMany({
    where: {
      id: { in: [...ids] },
      mediateurId,
      suppression: null,
    },
    select: { id: true },
  })

  return beneficiaires.map(({ id }) => BeneficiaireId(id))
}
