import { prismaClient } from '@/configuration/prisma'
import { beneficiaireFromDomain } from '@/features/beneficiaire/implementations/prisma/beneficiaire.transfer'
import type { EnregistrerLaModification } from '../../domain/modifier-beneficiaire'

export const enregistrerLaModification: EnregistrerLaModification = async (
  beneficiaire,
) => {
  const { id, ...data } = beneficiaireFromDomain(beneficiaire)
  await prismaClient.beneficiaire.update({ where: { id }, data })
}
