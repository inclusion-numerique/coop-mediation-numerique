import { contactEmail } from '@/configuration/projet'
import {
  emailTransport,
  expediteur,
  throwOnSendMailFailure,
} from '@/configuration/smtp'
import { compteSupprime } from '@/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/implementations/email/compte-supprime.email'
import { compileMjml } from '@/libraries/emails/rendu'

export const envoyerLaSuppressionDuCompte = async ({
  email,
  isMediateur,
}: {
  email: string
  isMediateur: boolean
}) => {
  const result = await emailTransport.sendMail({
    to: email,
    from: expediteur,
    replyTo: contactEmail(),
    subject: 'Votre compte a été supprimé',
    text: compteSupprime.text({ isMediateur }),
    html: await compileMjml(compteSupprime.mjml({ isMediateur })),
  })

  throwOnSendMailFailure(result)
}
