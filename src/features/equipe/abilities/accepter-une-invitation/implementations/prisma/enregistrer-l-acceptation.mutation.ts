import { addMutationLog, prismaClient } from '@/configuration/prisma'
import { adhesionActive } from '../../../../domain'
import {
  adhesionSelect,
  toAdhesion,
} from '../../../../implementations/prisma/adhesion.transfer'
import type { CleDInvitation } from '../../../../implementations/prisma/invitation.query'
import type { EnregistrerLAcceptation } from '../../domain/accepter-une-invitation'

export const enregistrerLAcceptation: EnregistrerLAcceptation<
  CleDInvitation
> = async ({ cle, reference, mediateurId, auteurId, maintenant }) => {
  await prismaClient.$transaction(async (transaction) => {
    await transaction.invitationEquipe.update({
      where: cle,
      data: { acceptee: maintenant, mediateurId },
    })

    const adhesions = await transaction.mediateurCoordonne.findMany({
      where: { mediateurId, coordinateurId: reference.coordinateurId },
      select: adhesionSelect,
    })

    if (adhesionActive(adhesions.map(toAdhesion)) === null)
      await transaction.mediateurCoordonne.create({
        data: { mediateurId, coordinateurId: reference.coordinateurId },
      })
  })

  addMutationLog({
    userId: auteurId,
    nom: 'AccepterInvitationMediateurCoordonne',
    data: {
      email: reference.email,
      coordinateurId: reference.coordinateurId,
    },
  })
}
