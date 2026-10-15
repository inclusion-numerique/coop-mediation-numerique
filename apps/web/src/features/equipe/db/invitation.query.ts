import { prismaClient } from '@app/web/prismaClient'
import type { Invitation, ReferenceInvitation } from '../domain'
import { invitationSelect, toInvitation } from './invitation.transfer'

export type CleDInvitation = {
  readonly email_coordinateurId: {
    readonly email: string
    readonly coordinateurId: string
  }
}

export type InvitationLue = {
  readonly invitation: Invitation
  readonly cle: CleDInvitation
}

export const lireUneInvitation = async ({
  email,
  coordinateurId,
}: ReferenceInvitation): Promise<InvitationLue | null> => {
  const ligne = await prismaClient.invitationEquipe.findFirst({
    where: { email: { equals: email, mode: 'insensitive' }, coordinateurId },
    select: invitationSelect,
  })
  if (ligne === null) return null

  const invitation = toInvitation(ligne)
  return invitation === null
    ? null
    : {
        invitation,
        cle: {
          email_coordinateurId: {
            email: ligne.email,
            coordinateurId: ligne.coordinateurId,
          },
        },
      }
}
