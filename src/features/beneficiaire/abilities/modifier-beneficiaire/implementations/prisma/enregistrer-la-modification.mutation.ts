import { prismaClient } from '@/configuration/prisma'
import { beneficiaireFromDomain } from '@/features/beneficiaire/implementations/prisma/beneficiaire.transfer'
import type { EnregistrerLaModification } from '../../domain/ports'

export const enregistrerLaModification: EnregistrerLaModification = async (
  beneficiaire,
) => {
  const { id, ...data } = beneficiaireFromDomain(beneficiaire)
  await prismaClient.beneficiaire.update({
    where: { id, mediateurId: beneficiaire.mediateurId, suppression: null },
    data,
  })
}
