import { compileMjml } from '@app/emails/mjml'
import { acceptInvitation } from '@app/emails/templates/acceptInvitation'
import { declineInvitation } from '@app/emails/templates/declineInvitation'
import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import { emailTransport } from '@app/web/server/email/emailTransport'
import { throwOnSendMailFailure } from '@app/web/server/email/throwOnSendMailFailure'
import * as Sentry from '@sentry/nextjs'
import type { Email } from '../../domain'

const reponses = {
  Acceptee: {
    gabarit: acceptInvitation,
    sujet: (invite: string) =>
      `${invite} a accepté votre invitation à rejoindre votre équipe`,
  },
  Refusee: {
    gabarit: declineInvitation,
    sujet: (invite: string) =>
      `${invite} a refusé l‘invitation à rejoindre votre équipe`,
  },
} as const

const envoyer = async ({
  coordinateur,
  invite,
  reponse,
}: {
  coordinateur: string
  invite: Email
  reponse: keyof typeof reponses
}): Promise<void> => {
  const { gabarit, sujet } = reponses[reponse]

  const resultat = await emailTransport.sendMail({
    to: coordinateur,
    from: ServerWebAppConfig.Email.from,
    replyTo: PublicWebAppConfig.contactEmail,
    subject: sujet(invite),
    text: gabarit.text({ mediateur: invite }),
    html: await compileMjml(gabarit.mjml({ mediateur: invite })),
  })

  throwOnSendMailFailure(resultat)
}

export const prevenirLeCoordinateur = async (
  prevenir: Parameters<typeof envoyer>[0],
): Promise<void> => {
  try {
    await envoyer(prevenir)
  } catch (erreur) {
    Sentry.captureException?.(erreur)
  }
}
