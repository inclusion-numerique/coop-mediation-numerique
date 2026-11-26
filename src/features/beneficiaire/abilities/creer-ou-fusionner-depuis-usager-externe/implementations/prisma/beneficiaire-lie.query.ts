import { prismaClient } from '@/configuration/prisma'
import type { LireLeBeneficiaireLie } from '../../domain/ports'
import { beneficiaireFusionneSelect } from './beneficiaire-fusionne.select'
import { sansException } from './echec-technique.adapter'

export const lireLeBeneficiaireLie: LireLeBeneficiaireLie = ({
  rdvUserId,
  mediateurId,
}) =>
  sansException(() =>
    prismaClient.beneficiaire.findFirst({
      where: { rdvUserId, mediateurId, suppression: null, anonyme: false },
      select: beneficiaireFusionneSelect,
    }),
  )
