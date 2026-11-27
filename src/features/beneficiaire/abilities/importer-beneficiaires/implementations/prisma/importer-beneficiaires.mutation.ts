import { prismaClient } from '@/configuration/prisma'
import { beneficiaireFromDomain } from '@/features/beneficiaire/implementations/prisma/beneficiaire.transfer'
import type { EnregistrerLesBeneficiairesImportes } from '../../domain/ports'

export const enregistrerLesBeneficiairesImportes: EnregistrerLesBeneficiairesImportes =
  async (beneficiaires) => {
    await prismaClient.beneficiaire.createMany({
      data: beneficiaires.map((beneficiaire) => ({
        ...beneficiaireFromDomain(beneficiaire),
        import: beneficiaire.creation,
      })),
    })
  }
