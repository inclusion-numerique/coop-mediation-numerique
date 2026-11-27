import { contactEmail } from '@/configuration/projet'
import {
  emailTransport,
  expediteur,
  throwOnSendMailFailure,
} from '@/configuration/smtp'
import { avertissementDeSuppression } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees/implementations/email/avertissement-de-suppression.email'
import type { EnvoyerLAvertissement } from '@/features/utilisateurs/domain'
import { compileMjml } from '@/libraries/emails/rendu'
import { attraperEnEchecTechnique } from '@/libraries/result'

const envoyer = async ({
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
    replyTo: contactEmail(),
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

export const envoyerLAvertissementDeSuppression: EnvoyerLAvertissement = (
  { courriel, prenom },
  { suppressionLe, joursRestants },
) =>
  attraperEnEchecTechnique(envoyer)({
    email: courriel,
    firstname: prenom,
    deletionDate: suppressionLe.toLocaleDateString('fr-FR'),
    daysRemaining: joursRestants,
    matomoCampaignId: 'finaliser_inscription_j90',
  })
