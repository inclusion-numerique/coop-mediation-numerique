import { contactEmail } from '@/configuration/projet/config'
import { emailTransport } from '@/configuration/smtp/email-transport'
import { expediteur } from '@/configuration/smtp/serveur'
import { throwOnSendMailFailure } from '@/configuration/smtp/throw-on-send-mail-failure'
import { avertissementDeSuppression } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/implementations/email/avertissement-de-suppression.email'
import { compileMjml } from '@/libraries/emails/mjml'

export const envoyerLAvertissementDeSuppression = async ({
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
    from: expediteur,
    replyTo: contactEmail,
    subject: `Votre compte va bientôt être supprimé ⚠️`,
    text: avertissementDeSuppression.text({
      firstname,
      deletionDate,
      daysRemaining,
      matomoCampaignId,
    }),
    html: await compileMjml(
      avertissementDeSuppression.mjml({
        firstname,
        deletionDate,
        daysRemaining,
        matomoCampaignId,
      }),
    ),
  })

  throwOnSendMailFailure(result)
}
