import { finishYourSignupDeletionWarningEmail } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/implementation/email/finishYourSignupDeletionWarningEmail'
import { compileMjml } from '@/libraries/emails/mjml'
import { PublicWebAppConfig } from '@/PublicWebAppConfig'
import { ServerWebAppConfig } from '@/ServerWebAppConfig'
import { emailTransport } from '@/server/email/emailTransport'
import { throwOnSendMailFailure } from '@/server/email/throwOnSendMailFailure'

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
    html: await compileMjml(
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
