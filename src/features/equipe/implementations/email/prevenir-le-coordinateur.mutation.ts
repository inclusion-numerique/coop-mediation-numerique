import { contactEmail } from '@/configuration/projet'
import {
  emailTransport,
  expediteur,
  throwOnSendMailFailure,
} from '@/configuration/smtp'
import { signaler } from '@/configuration/telemetry/serveur'
import { invitationAcceptee } from '@/features/equipe/implementations/email/invitation-acceptee.email'
import { invitationRefusee } from '@/features/equipe/implementations/email/invitation-refusee.email'
import { compileMjml } from '@/libraries/emails/rendu'
import type { Prevenance, PrevenirLeCoordinateur } from '../../domain'

const reponses = {
  Acceptee: {
    gabarit: invitationAcceptee,
    sujet: (invite: string) =>
      `${invite} a accepté votre invitation à rejoindre votre équipe`,
  },
  Refusee: {
    gabarit: invitationRefusee,
    sujet: (invite: string) =>
      `${invite} a refusé l‘invitation à rejoindre votre équipe`,
  },
} as const

const envoyer = async ({
  coordinateur,
  invite,
  reponse,
}: Prevenance): Promise<void> => {
  const { gabarit, sujet } = reponses[reponse]

  const resultat = await emailTransport.sendMail({
    to: coordinateur,
    from: expediteur,
    replyTo: contactEmail(),
    subject: sujet(invite),
    text: gabarit.text({ mediateur: invite }),
    html: await compileMjml(gabarit.mjml({ mediateur: invite })),
  })

  throwOnSendMailFailure(resultat)
}

export const prevenirLeCoordinateur: PrevenirLeCoordinateur = async (
  prevenir,
) => {
  try {
    await envoyer(prevenir)
  } catch (erreur) {
    signaler(erreur)
  }
}
