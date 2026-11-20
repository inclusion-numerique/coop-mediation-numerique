import { PublicWebAppConfig } from '@/configuration/projet/PublicWebAppConfig'
import { emailTransport } from '@/configuration/smtp/emailTransport'
import { expediteur } from '@/configuration/smtp/serveur'
import { throwOnSendMailFailure } from '@/configuration/smtp/throwOnSendMailFailure'
import { finishYourSignupAccountDeletedEmail } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/implementation/email/finishYourSignupAccountDeletedEmail'
import { compileMjml } from '@/libraries/emails/mjml'

export const sendAccountDeletedEmail = async ({
  email,
  firstname,
}: {
  email: string
  firstname: string | null
}) => {
  const result = await emailTransport.sendMail({
    to: email,
    from: expediteur,
    replyTo: PublicWebAppConfig.contactEmail,

    subject: 'Votre compte a été supprimé',
    text: finishYourSignupAccountDeletedEmail.text({ firstname }),
    html: await compileMjml(
      finishYourSignupAccountDeletedEmail.mjml({ firstname }),
    ),
  })

  throwOnSendMailFailure(result)
}
