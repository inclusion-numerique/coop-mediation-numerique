import { prismaClient } from '@app/web/prismaClient'
import type { Invitation, ReferenceInvitation } from '../domain'
import { invitationSelect, toInvitation } from './invitation.transfer'

export const lireUneInvitation = async ({
  email,
  coordinateurId,
}: ReferenceInvitation): Promise<Invitation | null> => {
  const ligne = await prismaClient.invitationEquipe.findUnique({
    where: { email_coordinateurId: { email, coordinateurId } },
    select: invitationSelect,
  })

  return ligne === null ? null : toInvitation(ligne)
}

export const cleDeLInvitation = ({
  email,
  coordinateurId,
}: ReferenceInvitation) => ({
  email_coordinateurId: { email, coordinateurId },
})
