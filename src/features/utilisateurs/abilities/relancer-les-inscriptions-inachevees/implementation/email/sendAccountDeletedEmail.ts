import { PublicWebAppConfig } from '@/configuration/projet/PublicWebAppConfig'
import { ServerWebAppConfig } from '@/configuration/projet/ServerWebAppConfig'
import { emailTransport } from '@/configuration/smtp/emailTransport'
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
    from: ServerWebAppConfig.Email.from,
    replyTo: PublicWebAppConfig.contactEmail,

    subject: 'Votre compte a été supprimé',
    text: finishYourSignupAccountDeletedEmail.text({ firstname }),
    html: await compileMjml(
      finishYourSignupAccountDeletedEmail.mjml({ firstname }),
    ),
  })

  throwOnSendMailFailure(result)
}
