import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { CleDInvitation } from '../../../../implementations/prisma/invitation.query'
import type { EnregistrerLAcceptation } from '../../domain/ports'

export const enregistrerLAcceptation: EnregistrerLAcceptation<
  CleDInvitation
> = async ({ cle, reference, mediateurId, auteurId, accepteeLe, adhesion }) => {
  await prismaClient.$transaction([
    prismaClient.invitationEquipe.update({
      where: cle,
      data: { acceptee: accepteeLe, mediateurId },
    }),
    ...(adhesion === null
      ? []
      : [prismaClient.mediateurCoordonne.create({ data: adhesion })]),
  ])

  addMutationLog({
    userId: auteurId,
    nom: 'AccepterInvitationMediateurCoordonne',
    data: {
      email: reference.email,
      coordinateurId: reference.coordinateurId,
    },
  })
}
