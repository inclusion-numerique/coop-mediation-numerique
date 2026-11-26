import { addMutationLog, prismaClient } from '@/configuration/prisma'
import { fromInvitation } from '../../../../implementations/prisma/invitation.transfer'
import type { EnregistrerLesInvitations } from '../../domain/inviter-des-membres'
import type { EmailsStockes } from './existant.query'

export const enregistrerLesInvitations: EnregistrerLesInvitations<
  EmailsStockes
> = async ({ invitations, cles, coordinateurId, auteurId }) => {
  await prismaClient.$transaction(
    invitations.map((invitation) => {
      const ligne = fromInvitation(invitation)
      return prismaClient.invitationEquipe.upsert({
        where: {
          email_coordinateurId: {
            email: cles.get(invitation.reference.email) ?? ligne.email,
            coordinateurId: ligne.coordinateurId,
          },
        },
        create: ligne,
        update: ligne,
      })
    }),
  )

  addMutationLog({
    userId: auteurId,
    nom: 'InviterMediateursCoordonnes',
    data: {
      coordinateurId,
      emails: invitations.map(({ reference }) => reference.email),
    },
  })
}
