import { prismaClient } from '@/configuration/prisma'
import type { CreationDuBeneficiaire } from '../../domain/ports'

export const creationDuBeneficiaire: CreationDuBeneficiaire = async ({
  id,
  mediateurId,
}) => {
  const existant = await prismaClient.beneficiaire.findFirst({
    where: { id, mediateurId, suppression: null },
    select: { creation: true },
  })

  return existant?.creation ?? null
}
