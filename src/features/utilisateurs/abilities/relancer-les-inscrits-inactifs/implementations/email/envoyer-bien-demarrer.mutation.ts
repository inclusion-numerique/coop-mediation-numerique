import { contactEmail } from '@/configuration/projet/config'
import { emailTransport } from '@/configuration/smtp/email-transport'
import { expediteur } from '@/configuration/smtp/serveur'
import { throwOnSendMailFailure } from '@/configuration/smtp/throw-on-send-mail-failure'
import { bienDemarrer } from '@/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/implementations/email/bien-demarrer.email'
import { compileMjml } from '@/libraries/emails/mjml'

export const envoyerBienDemarrer = async ({
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
    text: bienDemarrer.text({
      firstname,
      matomoCampaignId,
      isMediateur,
      isCoordinateur,
    }),
    html: await compileMjml(
      bienDemarrer.mjml({
        firstname,
        matomoCampaignId,
        isMediateur,
        isCoordinateur,
      }),
    ),
  })

  throwOnSendMailFailure(result)
}
