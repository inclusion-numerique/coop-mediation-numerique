import { compileMjml } from '@app/emails/mjml'
import { finishYourSignupDeletionWarningEmail } from '@app/emails/templates/finishYourSignupDeletionWarningEmail'
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
    subject: `Votre compte va bientôt être supprimé ⚠️`,
    text: finishYourSignupDeletionWarningEmail.text({
      firstname,
      deletionDate,
      daysRemaining,
      matomoCampaignId,
    }),
    html: compileMjml(
      finishYourSignupDeletionWarningEmail.mjml({
        firstname,
        deletionDate,
        daysRemaining,
        matomoCampaignId,
      }),
    ),
  })

  throwOnSendMailFailure(result)
}
