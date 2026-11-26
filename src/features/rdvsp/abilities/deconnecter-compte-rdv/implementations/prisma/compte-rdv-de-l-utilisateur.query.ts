import { prismaClient } from '@/configuration/prisma'
import { compteRdvToDomain } from '../../../../implementations/prisma/compte-rdv.transfer'
import type { CompteRdvDeLUtilisateur } from '../../domain/deconnecter-compte-rdv'

export const compteRdvDeLUtilisateur: CompteRdvDeLUtilisateur = async (
  utilisateurId,
) => {
  const row = await prismaClient.rdvAccount.findUnique({
    where: { userId: utilisateurId },
    include: { organisations: { select: { organisationId: true } } },
  })

  return row === null ? null : compteRdvToDomain(row)
}
