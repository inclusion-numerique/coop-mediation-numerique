import { finishYourSignupEmail } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/implementation/email/finishYourSignupEmail'
import { compileMjml } from '@/libraries/emails/mjml'
import { PublicWebAppConfig } from '@/PublicWebAppConfig'
import { ServerWebAppConfig } from '@/ServerWebAppConfig'
import { emailTransport } from '@/server/email/emailTransport'
import { throwOnSendMailFailure } from '@/server/email/throwOnSendMailFailure'

export const sendFinishYourSignupEmail = async ({
  email,
  firstname,
  totalUsers,
  matomoCampaignId,
}: {
  email: string
  firstname: string | null
  totalUsers: number
  matomoCampaignId: string
}) => {
  const result = await emailTransport.sendMail({
    to: email,
    from: ServerWebAppConfig.Email.from,
    replyTo: PublicWebAppConfig.contactEmail,
    subject: `${firstname}, votre inscription sur La Coop n’est pas terminée 💌`,
    text: finishYourSignupEmail.text({
      firstname,
      totalUsers,
      matomoCampaignId,
    }),
    html: await compileMjml(
      finishYourSignupEmail.mjml({ firstname, totalUsers, matomoCampaignId }),
    ),
  })

  throwOnSendMailFailure(result)
}
