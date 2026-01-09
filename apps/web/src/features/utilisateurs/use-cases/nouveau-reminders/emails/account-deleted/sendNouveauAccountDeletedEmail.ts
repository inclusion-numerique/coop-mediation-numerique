import { compileMjml } from '@app/emails/mjml'
import { nouveauAccountDeletedEmail } from '@app/emails/templates/nouveauAccountDeletedEmail'
import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import { emailTransport } from '@app/web/server/email/emailTransport'
import { throwOnSendMailFailure } from '@app/web/server/email/throwOnSendMailFailure'

export const sendNouveauAccountDeletedEmail = async ({
  email,
  isMediateur,
}: {
  email: string
  isMediateur: boolean
}) => {
  const result = await emailTransport.sendMail({
    to: email,
    from: ServerWebAppConfig.Email.from,
    replyTo: PublicWebAppConfig.contactEmail,
    subject: 'Votre compte La Coop a été supprimé',
    text: nouveauAccountDeletedEmail.text({ isMediateur }),
    html: compileMjml(nouveauAccountDeletedEmail.mjml({ isMediateur })),
  })

  throwOnSendMailFailure(result)
}
