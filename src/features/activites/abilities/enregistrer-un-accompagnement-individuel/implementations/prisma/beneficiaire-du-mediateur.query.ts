import { prismaClient } from '@/configuration/prisma'
import type { BeneficiaireDuMediateur } from '../../domain'

export const beneficiaireDuMediateur: BeneficiaireDuMediateur = ({
  id,
  mediateurId,
}) =>
  prismaClient.beneficiaire.findFirst({
    where: { id, mediateurId, suppression: null, fusionVersId: null },
    select: { anonyme: true },
  })
