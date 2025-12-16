import { compileMjml } from '@app/emails/mjml'
import { accountDeletedEmail } from '@app/emails/templates/accountDeletedEmail'
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

    subject: 'Votre compte La Coop a été supprimé',
    text: accountDeletedEmail.text({ firstname }),
    html: compileMjml(accountDeletedEmail.mjml({ firstname })),
  })

  throwOnSendMailFailure(result)
}
