import { contactEmail } from '@/configuration/projet/config'
import { emailTransport } from '@/configuration/smtp/emailTransport'
import { expediteur } from '@/configuration/smtp/serveur'
import { throwOnSendMailFailure } from '@/configuration/smtp/throwOnSendMailFailure'
import { finishYourSignupEmail } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/implementation/email/finishYourSignupEmail'
import { compileMjml } from '@/libraries/emails/mjml'

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
    from: expediteur,
    replyTo: contactEmail,
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
