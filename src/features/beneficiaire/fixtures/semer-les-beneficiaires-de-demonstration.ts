import { prismaClient } from '@/configuration/prisma'
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
