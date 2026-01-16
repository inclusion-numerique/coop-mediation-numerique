import { compileMjml } from '@app/emails/mjml'
import { finishYourSignupAccountDeletedEmail } from '@app/emails/templates/finishYourSignupAccountDeletedEmail'
import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import { emailTransport } from '@app/web/server/email/emailTransport'
import { throwOnSendMailFailure } from '@app/web/server/email/throwOnSendMailFailure'

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
    html: compileMjml(finishYourSignupAccountDeletedEmail.mjml({ firstname })),
  })

  throwOnSendMailFailure(result)
}
