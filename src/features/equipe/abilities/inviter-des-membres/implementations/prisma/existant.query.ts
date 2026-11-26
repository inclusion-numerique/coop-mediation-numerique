import { prismaClient } from '@/configuration/prisma'
import { Courriel, MediateurId } from '../../../../domain'
import {
  invitationSelect,
  toInvitation,
} from '../../../../implementations/prisma/invitation.transfer'
import type { Existant } from '../../domain/planifier'
import type { LireLExistant } from '../../domain/ports'

export type EmailsStockes = ReadonlyMap<Courriel, string>

export const lireLExistant: LireLExistant<EmailsStockes> = async ({
  coordinateurId,
  candidats,
}) => {
  const [invitations, membres, mediateurs] = await Promise.all([
    prismaClient.invitationEquipe.findMany({
      where: {
        coordinateurId,
        email: { in: [...candidats], mode: 'insensitive' },
      },
      select: invitationSelect,
    }),
    prismaClient.mediateurCoordonne.findMany({
      where: {
        coordinateurId,
        suppression: null,
        mediateur: {
          user: { email: { in: [...candidats], mode: 'insensitive' } },
        },
      },
      select: { mediateur: { select: { user: { select: { email: true } } } } },
    }),
    prismaClient.user.findMany({
      where: {
        email: { in: [...candidats], mode: 'insensitive' },
        mediateur: { isNot: null },
      },
      select: { email: true, mediateur: { select: { id: true } } },
    }),
  ])

  const lues = invitations.flatMap((ligne) => {
    const invitation = toInvitation(ligne)
    return invitation === null ? [] : [{ invitation, stocke: ligne.email }]
  })

  const existant: Existant = {
    invitations: lues.map(({ invitation }) => invitation),
    membresActifs: new Set(
      membres.flatMap(({ mediateur }) => {
        const email = Courriel.safe(mediateur.user.email)
        return email === null ? [] : [email]
      }),
    ),
    mediateursConnus: new Map(
      mediateurs.flatMap(({ email, mediateur }) => {
        const canonique = Courriel.safe(email)
        return canonique === null || mediateur === null
          ? []
          : [[canonique, MediateurId(mediateur.id)] as const]
      }),
    ),
  }

  return {
    existant,
    cles: new Map(
      lues.map(({ invitation, stocke }) => [
        invitation.reference.email,
        stocke,
      ]),
    ),
  }
}
