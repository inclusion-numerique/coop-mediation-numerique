import { prismaClient } from '@/configuration/prisma/prismaClient'
import {
  beneficiairesDeDemonstration,
  type MediateursDesBeneficiaires,
} from './beneficiaires'

export const semerLesBeneficiairesDeDemonstration =
  (mediateurs: MediateursDesBeneficiaires) => (mediateurId: string) =>
    prismaClient.beneficiaire.createMany({
      data: beneficiairesDeDemonstration(mediateurs).tous.filter(
        (beneficiaire) => beneficiaire.mediateurId === mediateurId,
      ),
    })
