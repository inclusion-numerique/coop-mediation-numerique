import { prismaClient } from '@/configuration/prisma'
import type { InvitationLue, LireUneInvitation } from '../../domain'
import { invitationSelect, toInvitation } from './invitation.transfer'

export type CleDInvitation = {
  readonly email_coordinateurId: {
    readonly email: string
    readonly coordinateurId: string
  }
}

export const lireUneInvitation: LireUneInvitation<CleDInvitation> = async ({
  email,
  coordinateurId,
}): Promise<InvitationLue<CleDInvitation> | null> => {
  const ligne = await prismaClient.invitationEquipe.findFirst({
    where: { email: { equals: email, mode: 'insensitive' }, coordinateurId },
    select: invitationSelect,
  })
  if (ligne === null) return null

  return {
    invitation: toInvitation(ligne),
    cle: {
      email_coordinateurId: {
        email: ligne.email,
        coordinateurId: ligne.coordinateurId,
      },
    },
  }
}
