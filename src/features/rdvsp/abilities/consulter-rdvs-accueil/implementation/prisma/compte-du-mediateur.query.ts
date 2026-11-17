import { prismaClient } from '@app/web/prismaClient'
import { compteRdvToDomain } from '../../../../db'
import type { CompteDuMediateur } from '../../domain/consulter-rdvs-accueil'

export const compteDuMediateur: CompteDuMediateur = async (utilisateurId) => {
  const row = await prismaClient.rdvAccount.findUnique({
    where: { userId: utilisateurId },
    include: { organisations: { select: { organisationId: true } } },
  })

  return row === null ? null : compteRdvToDomain(row)
}
