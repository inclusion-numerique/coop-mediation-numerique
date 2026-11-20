import { PublicWebAppConfig } from '@/configuration/projet/PublicWebAppConfig'
import { emailTransport } from '@/configuration/smtp/emailTransport'
import { expediteur } from '@/configuration/smtp/serveur'
import { throwOnSendMailFailure } from '@/configuration/smtp/throwOnSendMailFailure'
import { nouveauAccountDeletionWarningEmail } from '@/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/implementation/email/nouveauAccountDeletionWarningEmail'
import { compileMjml } from '@/libraries/emails/mjml'

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
    from: expediteur,
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
    html: await compileMjml(
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
