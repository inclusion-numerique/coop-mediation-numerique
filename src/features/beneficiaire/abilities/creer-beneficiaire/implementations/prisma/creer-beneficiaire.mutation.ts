import { prismaClient } from '@/configuration/prisma'
import { beneficiaireFromDomain } from '@/features/beneficiaire/implementations/prisma/beneficiaire.transfer'
import type { EnregistrerLeBeneficiaire } from '../../domain/ports'

export const enregistrerLeBeneficiaire: EnregistrerLeBeneficiaire = async (
  beneficiaire,
) => {
  await prismaClient.$transaction(async (tx) => {
    await tx.beneficiaire.create({ data: beneficiaireFromDomain(beneficiaire) })
    await tx.mediateur.update({
      where: { id: beneficiaire.mediateurId },
      data: {
        derniereCreationBeneficiaire: beneficiaire.creation,
      },
    })
  })
}
