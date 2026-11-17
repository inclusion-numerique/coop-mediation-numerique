import { gettingStartedEmail } from '@app/web/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/implementation/email/gettingStartedEmail'
import { compileMjml } from '@app/web/libraries/emails/mjml'
import { PublicWebAppConfig } from '@app/web/PublicWebAppConfig'
import { ServerWebAppConfig } from '@app/web/ServerWebAppConfig'
import { emailTransport } from '@app/web/server/email/emailTransport'
import { throwOnSendMailFailure } from '@app/web/server/email/throwOnSendMailFailure'

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
