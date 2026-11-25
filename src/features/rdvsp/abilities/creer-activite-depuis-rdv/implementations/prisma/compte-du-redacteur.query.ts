import { prismaClient } from '@/configuration/prisma'
import { compteRdvToDomain } from '../../../../implementations/prisma/compte-rdv.transfer'
import type { CompteDuRedacteur } from '../../domain/creer-activite-depuis-rdv'

export const compteDuRedacteur: CompteDuRedacteur = async (utilisateurId) => {
  const row = await prismaClient.rdvAccount.findUnique({
    where: { userId: utilisateurId },
    include: { organisations: { select: { organisationId: true } } },
  })

  return row === null ? null : compteRdvToDomain(row)
}
