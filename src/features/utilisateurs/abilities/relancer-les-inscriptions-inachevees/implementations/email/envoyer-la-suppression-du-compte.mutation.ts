import { contactEmail } from '@/configuration/projet/config'
import { emailTransport } from '@/configuration/smtp/emailTransport'
import { expediteur } from '@/configuration/smtp/serveur'
import { throwOnSendMailFailure } from '@/configuration/smtp/throwOnSendMailFailure'
import { compteSupprime } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/implementations/email/compte-supprime.email'
import { compileMjml } from '@/libraries/emails/mjml'

export const envoyerLaSuppressionDuCompte = async ({
  email,
  firstname,
}: {
  email: string
  firstname: string | null
}) => {
  const result = await emailTransport.sendMail({
    to: email,
    from: expediteur,
    replyTo: contactEmail,

    subject: 'Votre compte a été supprimé',
    text: compteSupprime.text({ firstname }),
    html: await compileMjml(compteSupprime.mjml({ firstname })),
  })

  throwOnSendMailFailure(result)
}
