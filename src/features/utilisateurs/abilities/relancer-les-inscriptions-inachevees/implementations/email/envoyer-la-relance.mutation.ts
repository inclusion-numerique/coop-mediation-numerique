import { contactEmail } from '@/configuration/projet'
import {
  emailTransport,
  expediteur,
  throwOnSendMailFailure,
} from '@/configuration/smtp'
import { relance } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/implementations/email/relance.email'
import type { EnvoyerLaRelance } from '@/features/utilisateurs/domain'
import { compileMjml } from '@/libraries/emails/rendu'
import { attraperEnEchecTechnique } from '@/libraries/result'

const envoyer = async ({
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
    replyTo: contactEmail(),
    subject: `${firstname}, votre inscription sur La Coop n’est pas terminée 💌`,
    text: relance.text({
      firstname,
      totalUsers,
      matomoCampaignId,
    }),
    html: await compileMjml(
      relance.mjml({ firstname, totalUsers, matomoCampaignId }),
    ),
  })

  throwOnSendMailFailure(result)
}

export const envoyerLaRelance =
  (totalInscrits: number): EnvoyerLaRelance =>
  ({ courriel, prenom }, palier) =>
    attraperEnEchecTechnique(envoyer)({
      email: courriel,
      firstname: prenom,
      totalUsers: totalInscrits,
      matomoCampaignId: `finaliser_inscription_j${palier}`,
    })
