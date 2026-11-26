import { prismaClient } from '@/configuration/prisma'
import { Courriel, MediateurId } from '../../../../domain'
import {
  invitationSelect,
  toInvitation,
} from '../../../../implementations/prisma/invitation.transfer'
import type {
  LireLeMediateurInvite,
  LireLesInvitationsDe,
} from '../../domain/ports'

export const lireLeMediateurInvite: LireLeMediateurInvite = async (
  utilisateurId,
) => {
  const utilisateur = await prismaClient.user.findUnique({
    where: { id: utilisateurId },
    select: { email: true, mediateur: { select: { id: true } } },
  })

  return utilisateur?.mediateur == null
    ? null
    : {
        mediateurId: MediateurId(utilisateur.mediateur.id),
        email: Courriel(utilisateur.email),
      }
}

export const lireLesInvitationsDe: LireLesInvitationsDe = async (email) => {
  const lignes = await prismaClient.invitationEquipe.findMany({
    where: { email: { equals: email, mode: 'insensitive' } },
    select: invitationSelect,
  })

  return lignes.flatMap((ligne) => {
    const invitation = toInvitation(ligne)
    return invitation === null ? [] : [invitation]
  })
}
