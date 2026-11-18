import { PublicWebAppConfig } from '@/configuration/projet/PublicWebAppConfig'
import { ServerWebAppConfig } from '@/configuration/projet/ServerWebAppConfig'
import { emailTransport } from '@/configuration/smtp/emailTransport'
import { throwOnSendMailFailure } from '@/configuration/smtp/throwOnSendMailFailure'
import { gettingStartedEmail } from '@/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/implementation/email/gettingStartedEmail'
import { compileMjml } from '@/libraries/emails/mjml'

export const sendGettingStartedEmail = async ({
  email,
  firstname,
  matomoCampaignId,
  isMediateur,
  isCoordinateur,
}: {
  email: string
  firstname: string | null
  matomoCampaignId: string
  isMediateur: boolean
  isCoordinateur: boolean
}) => {
  const result = await emailTransport.sendMail({
    to: email,
    from: ServerWebAppConfig.Email.from,
    replyTo: PublicWebAppConfig.contactEmail,
    subject: 'Bien commencer sur La Coop 🚀',
    text: gettingStartedEmail.text({
      firstname,
      matomoCampaignId,
      isMediateur,
      isCoordinateur,
    }),
    html: await compileMjml(
      gettingStartedEmail.mjml({
        firstname,
        matomoCampaignId,
        isMediateur,
        isCoordinateur,
      }),
    ),
  })

  throwOnSendMailFailure(result)
}
