import { contactEmail } from '@/configuration/projet/config'
import { emailTransport } from '@/configuration/smtp/emailTransport'
import { expediteur } from '@/configuration/smtp/serveur'
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
    from: expediteur,
    replyTo: contactEmail,
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
