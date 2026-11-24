import { prismaClient } from '@/configuration/prisma/prisma-client'
import {
  beneficiairesDeDemonstration,
  type MediateursDesBeneficiaires,
} from './beneficiaires-de-demonstration'

export const semerLesBeneficiairesDeDemonstration =
  (mediateurs: MediateursDesBeneficiaires) => (mediateurId: string) =>
    prismaClient.beneficiaire.createMany({
      data: beneficiairesDeDemonstration(mediateurs).tous.filter(
        (beneficiaire) => beneficiaire.mediateurId === mediateurId,
      ),
    })
