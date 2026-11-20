import { contactEmail } from '@/configuration/projet/config'
import { emailTransport } from '@/configuration/smtp/emailTransport'
import { expediteur } from '@/configuration/smtp/serveur'
import { throwOnSendMailFailure } from '@/configuration/smtp/throwOnSendMailFailure'
import { nouveauAccountDeletedEmail } from '@/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/implementation/email/nouveauAccountDeletedEmail'
import { compileMjml } from '@/libraries/emails/mjml'

export const sendNouveauAccountDeletedEmail = async ({
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
    text: nouveauAccountDeletedEmail.text({ isMediateur }),
    html: await compileMjml(nouveauAccountDeletedEmail.mjml({ isMediateur })),
  })

  throwOnSendMailFailure(result)
}
