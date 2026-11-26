import { prismaClient } from '@/configuration/prisma'
import { attraperEnEchecTechnique } from '@/libraries/result'
import type { LireLeBeneficiaireLie } from '../../domain/ports'
import { beneficiaireFusionneSelect } from './beneficiaire-fusionne.select'
import { versBeneficiaireFusionne } from './beneficiaire-fusionne.transfer'

export const lireLeBeneficiaireLie: LireLeBeneficiaireLie =
  attraperEnEchecTechnique(async ({ rdvUserId, mediateurId }) => {
    const lie = await prismaClient.beneficiaire.findFirst({
      where: { rdvUserId, mediateurId, suppression: null, anonyme: false },
      select: beneficiaireFusionneSelect,
    })
    return lie === null ? null : versBeneficiaireFusionne(lie)
  })
