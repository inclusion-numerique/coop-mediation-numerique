import { prismaClient } from '@/configuration/prisma/prismaClient'
import { fixtureBeneficiaires } from './beneficiaires'

export const semerLesBeneficiairesDeDemonstration = (mediateurId: string) =>
  prismaClient.beneficiaire.createMany({
    data: fixtureBeneficiaires.filter(
      (beneficiaire) => beneficiaire.mediateurId === mediateurId,
    ),
  })
