import { compileMjml } from '@app/emails/mjml'
import { deletionWarningEmail } from '@app/emails/templates/deletionWarningEmail'
import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import { emailTransport } from '@app/web/server/email/emailTransport'
import { throwOnSendMailFailure } from '@app/web/server/email/throwOnSendMailFailure'

export const sendDeletionWarningEmail = async ({
  email,
  firstname,
  deletionDate,
  daysRemaining,
  matomoCampaignId,
}: {
  email: string
  firstname: string | null
  deletionDate: string
  daysRemaining: number
  matomoCampaignId: string
}) => {
  const result = await emailTransport.sendMail({
    to: email,
    from: ServerWebAppConfig.Email.from,
    replyTo: PublicWebAppConfig.contactEmail,
    subject: `${firstname}, votre compte La Coop va bientôt être supprimé ⚠️`,
    text: deletionWarningEmail.text({
      firstname,
      deletionDate,
      daysRemaining,
      matomoCampaignId,
    }),
    html: compileMjml(
      deletionWarningEmail.mjml({
        firstname,
        deletionDate,
        daysRemaining,
        matomoCampaignId,
      }),
    ),
  })

  throwOnSendMailFailure(result)
}
