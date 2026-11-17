import { signaler } from '@app/web/configuration/telemetry/error-reporter/server/signaler'
import { acceptInvitation } from '@app/web/features/equipe/implementation/email/acceptInvitation'
import { declineInvitation } from '@app/web/features/equipe/implementation/email/declineInvitation'
import { compileMjml } from '@app/web/libraries/emails/mjml'
import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import { emailTransport } from '@app/web/server/email/emailTransport'
import { throwOnSendMailFailure } from '@app/web/server/email/throwOnSendMailFailure'
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
    signaler(erreur)
  }
}
