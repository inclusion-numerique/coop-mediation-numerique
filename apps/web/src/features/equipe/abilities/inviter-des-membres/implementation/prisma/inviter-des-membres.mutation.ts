import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import * as Sentry from '@sentry/nextjs'
import { lireLeCoordinateur } from '../../../../db/coordinateur.query'
import {
  fromInvitation,
  invitationSelect,
  toInvitation,
} from '../../../../db/invitation.transfer'
import {
  type CoordinateurId,
  CoordinateurIntrouvable,
  Email,
  type InvitationEnAttente,
  MediateurId,
  type NomAffiche,
  type UtilisateurId,
} from '../../../../domain'
import { envoyerUneInvitation } from '../../../../implementation/email'
import {
  type AucuneInvitationAEnvoyer,
  type Existant,
  type InvitationsEnvoyees,
  planifier,
} from '../../domain'

type EmailStocke = ReadonlyMap<Email, string>

const lireLExistant = async (
  coordinateurId: CoordinateurId,
  candidats: readonly Email[],
): Promise<{ existant: Existant; emailsStockes: EmailStocke }> => {
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
        const email = Email.safe(mediateur.user.email)
        return email === null ? [] : [email]
      }),
    ),
    mediateursConnus: new Map(
      mediateurs.flatMap(({ email, mediateur }) => {
        const canonique = Email.safe(email)
        return canonique === null || mediateur === null
          ? []
          : [[canonique, MediateurId(mediateur.id)] as const]
      }),
    ),
  }

  return {
    existant,
    emailsStockes: new Map(
      lues.map(({ invitation, stocke }) => [
        invitation.reference.email,
        stocke,
      ]),
    ),
  }
}

const enregistrer = (
  invitations: readonly InvitationEnAttente[],
  emailsStockes: EmailStocke,
) =>
  prismaClient.$transaction(
    invitations.map((invitation) => {
      const ligne = fromInvitation(invitation)
      return prismaClient.invitationEquipe.upsert({
        where: {
          email_coordinateurId: {
            email: emailsStockes.get(invitation.reference.email) ?? ligne.email,
            coordinateurId: ligne.coordinateurId,
          },
        },
        create: ligne,
        update: ligne,
      })
    }),
  )

const envoyer =
  (de: NomAffiche) =>
  async (invitation: InvitationEnAttente): Promise<Email | null> => {
    try {
      await envoyerUneInvitation({
        invitation,
        de,
      })
      return null
    } catch (erreur) {
      Sentry.captureException?.(erreur)
      return invitation.reference.email
    }
  }

export const inviterDesMembres = async ({
  coordinateurId,
  candidats,
  auteurId,
  maintenant = new Date(),
}: {
  coordinateurId: CoordinateurId
  candidats: readonly Email[]
  auteurId: UtilisateurId
  maintenant?: Date
}): Promise<
  Result<
    InvitationsEnvoyees,
    AucuneInvitationAEnvoyer | CoordinateurIntrouvable
  >
> => {
  const coordinateur = await lireLeCoordinateur(coordinateurId)
  if (coordinateur === null) return failure(CoordinateurIntrouvable())

  const { existant, emailsStockes } = await lireLExistant(
    coordinateurId,
    candidats,
  )
  const planification = planifier({
    coordinateurId: coordinateurId,
    candidats,
    existant,
    maintenant,
  })
  if (!planification.success) return planification

  const { aEnvoyer, ecartes } = planification.data

  await enregistrer(aEnvoyer, emailsStockes)

  addMutationLog({
    userId: auteurId,
    nom: 'InviterMediateursCoordonnes',
    duration: 0,
    data: {
      coordinateurId: coordinateurId,
      emails: aEnvoyer.map(({ reference }) => reference.email),
    },
  })

  const echecs = (
    await Promise.all(aEnvoyer.map(envoyer(coordinateur.nom)))
  ).filter((email): email is Email => email !== null)

  return success({
    envoyees: aEnvoyer
      .map(({ reference }) => reference.email)
      .filter((email) => !echecs.includes(email)),
    ecartees: ecartes,
    echecs,
  })
}
