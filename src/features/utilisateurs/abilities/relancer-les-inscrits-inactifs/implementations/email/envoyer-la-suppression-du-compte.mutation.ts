import { contactEmail } from '@/configuration/projet/config'
import { emailTransport } from '@/configuration/smtp/emailTransport'
import { expediteur } from '@/configuration/smtp/serveur'
import { throwOnSendMailFailure } from '@/configuration/smtp/throwOnSendMailFailure'
import { compteSupprime } from '@/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/implementations/email/compte-supprime.email'
import { compileMjml } from '@/libraries/emails/mjml'

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
    replyTo: contactEmail,
    subject: 'Votre compte a été supprimé',
    text: compteSupprime.text({ isMediateur }),
    html: await compileMjml(compteSupprime.mjml({ isMediateur })),
  })

  throwOnSendMailFailure(result)
}
