import { prismaClient } from '@/configuration/prisma'
import { attraperEnEchecTechnique } from '@/libraries/result'
import type { LireLeBeneficiaireLie } from '../../domain/ports'
import { beneficiaireFusionneSelect } from './beneficiaire-fusionne.select'

export const lireLeBeneficiaireLie: LireLeBeneficiaireLie =
  attraperEnEchecTechnique(({ rdvUserId, mediateurId }) =>
    prismaClient.beneficiaire.findFirst({
      where: { rdvUserId, mediateurId, suppression: null, anonyme: false },
      select: beneficiaireFusionneSelect,
    }),
  )
