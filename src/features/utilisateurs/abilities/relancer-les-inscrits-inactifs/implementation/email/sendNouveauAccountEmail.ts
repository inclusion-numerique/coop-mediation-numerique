import { contactEmail } from '@/configuration/projet/config'
import { emailTransport } from '@/configuration/smtp/emailTransport'
import { expediteur } from '@/configuration/smtp/serveur'
import { throwOnSendMailFailure } from '@/configuration/smtp/throwOnSendMailFailure'
import { nouveauAccountEmail } from '@/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/implementation/email/nouveauAccountEmail'
import { compileMjml } from '@/libraries/emails/mjml'

export const sendNouveauAccountEmail = async ({
  email,
  firstname,
  totalUsers,
  matomoCampaignId,
  isMediateur,
  isCoordinateur,
  monthsCount,
}: {
  email: string
  firstname: string | null
  totalUsers: number
  matomoCampaignId: string
  isMediateur: boolean
  isCoordinateur: boolean
  monthsCount: 1 | 2
}) => {
  const result = await emailTransport.sendMail({
    to: email,
    from: expediteur,
    replyTo: contactEmail,
    subject: 'Votre compte est prêt, il ne manque que vous !',
    text: nouveauAccountEmail.text({
      firstname,
      totalUsers,
      matomoCampaignId,
      isMediateur,
      isCoordinateur,
      monthsCount,
    }),
    html: await compileMjml(
      nouveauAccountEmail.mjml({
        firstname,
        totalUsers,
        matomoCampaignId,
        isMediateur,
        isCoordinateur,
        monthsCount,
      }),
    ),
  })

  throwOnSendMailFailure(result)
}
