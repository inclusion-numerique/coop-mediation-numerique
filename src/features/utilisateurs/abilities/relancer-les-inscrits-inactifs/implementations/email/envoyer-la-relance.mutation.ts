import { contactEmail } from '@/configuration/projet'
import {
  emailTransport,
  expediteur,
  throwOnSendMailFailure,
} from '@/configuration/smtp'
import { relance } from '@/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/implementations/email/relance.email'
import { compileMjml } from '@/libraries/emails/rendu'

export const envoyerLaRelance = async ({
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
    replyTo: contactEmail(),
    subject: 'Votre compte est prêt, il ne manque que vous !',
    text: relance.text({
      firstname,
      totalUsers,
      matomoCampaignId,
      isMediateur,
      isCoordinateur,
      monthsCount,
    }),
    html: await compileMjml(
      relance.mjml({
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
