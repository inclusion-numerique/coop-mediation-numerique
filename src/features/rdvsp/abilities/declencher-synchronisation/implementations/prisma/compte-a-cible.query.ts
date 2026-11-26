import { prismaClient } from '@/configuration/prisma'
import { MediateurId } from '../../../../domain/identifiants/mediateur-id'
import { compteRdvToDomain } from '../../../../implementations/prisma/compte-rdv.transfer'
import type { CompteACible } from '../../domain/ports'

export const compteACible: CompteACible = async (utilisateurId) => {
  const row = await prismaClient.rdvAccount.findUnique({
    where: { userId: utilisateurId },
    include: {
      organisations: { select: { organisationId: true } },
      user: { select: { mediateur: { select: { id: true } } } },
    },
  })

  return row === null
    ? null
    : {
        compte: compteRdvToDomain(row),
        mediateurId:
          row.user.mediateur === null
            ? null
            : MediateurId(row.user.mediateur.id),
      }
}
