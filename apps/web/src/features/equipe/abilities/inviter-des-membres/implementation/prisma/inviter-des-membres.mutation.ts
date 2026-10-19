import { type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'
import * as Sentry from '@sentry/nextjs'
import {
  fromInvitation,
  invitationSelect,
  toInvitation,
} from '../../../../db/invitation.transfer'
import {
  type CoordinateurId,
  EmailInvitation,
  type InvitationEnAttente,
  lienInvitation,
  MediateurId,
  type UtilisateurId,
} from '../../../../domain'
import { envoyerUneInvitation } from '../../../../implementation/email'
import {
  type AucuneInvitationAEnvoyer,
  type Ecart,
  type Existant,
  planifier,
} from '../../domain'

export type InvitationsEnvoyees = {
  readonly envoyees: readonly EmailInvitation[]
  readonly ecartees: readonly Ecart[]
  readonly echecs: readonly EmailInvitation[]
}

type EmailStocke = ReadonlyMap<EmailInvitation, string>

const lireLExistant = async (
  coordinateurId: CoordinateurId,
  candidats: readonly EmailInvitation[],
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
        const email = EmailInvitation.safe(mediateur.user.email)
        return email === null ? [] : [email]
      }),
    ),
    mediateursConnus: new Map(
      mediateurs.flatMap(({ email, mediateur }) => {
        const canonique = EmailInvitation.safe(email)
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
  (de: string) =>
  async (invitation: InvitationEnAttente): Promise<EmailInvitation | null> => {
    try {
      await envoyerUneInvitation({
        invite: invitation.invite,
        lien: lienInvitation(invitation.reference),
        de,
      })
      return null
    } catch (erreur) {
      Sentry.captureException?.(erreur)
      return invitation.reference.email
    }
  }

export const inviterDesMembres = async ({
  coordinateur,
  candidats,
  auteurId,
  maintenant = new Date(),
}: {
  coordinateur: { readonly id: CoordinateurId; readonly nom: string }
  candidats: readonly EmailInvitation[]
  auteurId: UtilisateurId
  maintenant?: Date
}): Promise<Result<InvitationsEnvoyees, AucuneInvitationAEnvoyer>> => {
  const { existant, emailsStockes } = await lireLExistant(
    coordinateur.id,
    candidats,
  )
  const planification = planifier({
    coordinateurId: coordinateur.id,
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
      coordinateurId: coordinateur.id,
      emails: aEnvoyer.map(({ reference }) => reference.email),
    },
  })

  const echecs = (
    await Promise.all(aEnvoyer.map(envoyer(coordinateur.nom)))
  ).filter((email): email is EmailInvitation => email !== null)

  return success({
    envoyees: aEnvoyer
      .map(({ reference }) => reference.email)
      .filter((email) => !echecs.includes(email)),
    ecartees: ecartes,
    echecs,
  })
}
