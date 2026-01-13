import { compileMjml } from '@app/emails/mjml'
import { nouveauAccountDeletionWarningEmail } from '@app/emails/templates/nouveauAccountDeletionWarningEmail'
import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import { emailTransport } from '@app/web/server/email/emailTransport'
import { throwOnSendMailFailure } from '@app/web/server/email/throwOnSendMailFailure'

export const sendNouveauAccountDeletionWarningEmail = async ({
  email,
  firstname,
  deletionDate,
  daysRemaining,
  matomoCampaignId,
  isMediateur,
  isCoordinateur,
}: {
  email: string
  firstname: string | null
  deletionDate: string
  daysRemaining: number
  matomoCampaignId: string
  isMediateur: boolean
  isCoordinateur: boolean
}) => {
  const result = await emailTransport.sendMail({
    to: email,
    from: ServerWebAppConfig.Email.from,
    replyTo: PublicWebAppConfig.contactEmail,
    subject: `Votre compte va bientôt être supprimé ⚠️`,
    text: nouveauAccountDeletionWarningEmail.text({
      firstname,
      deletionDate,
      daysRemaining,
      matomoCampaignId,
      isMediateur,
      isCoordinateur,
    }),
    html: compileMjml(
      nouveauAccountDeletionWarningEmail.mjml({
        firstname,
        deletionDate,
        daysRemaining,
        matomoCampaignId,
        isMediateur,
        isCoordinateur,
      }),
    ),
  })

  throwOnSendMailFailure(result)
}
