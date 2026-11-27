import { contactEmail } from '@/configuration/projet'
import {
  emailTransport,
  expediteur,
  throwOnSendMailFailure,
} from '@/configuration/smtp'
import { avertissementDeSuppression } from '@/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/implementations/email/avertissement-de-suppression.email'
import { type EnvoyerLAvertissement } from '@/features/utilisateurs/domain'
import { compileMjml } from '@/libraries/emails/rendu'
import { attraperEnEchecTechnique } from '@/libraries/result'
import { profilDuCourriel } from './profil-du-destinataire.transfer'

const envoyer = async ({
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
    replyTo: contactEmail(),
    subject: `Votre compte va bientôt être supprimé ⚠️`,
    text: avertissementDeSuppression.text({
      firstname,
      deletionDate,
      daysRemaining,
      matomoCampaignId,
      isMediateur,
      isCoordinateur,
    }),
    html: await compileMjml(
      avertissementDeSuppression.mjml({
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

export const envoyerLAvertissementDeSuppression: EnvoyerLAvertissement = (
  destinataire,
  { suppressionLe, joursRestants },
) =>
  attraperEnEchecTechnique(envoyer)({
    email: destinataire.courriel,
    firstname: destinataire.prenom,
    deletionDate: suppressionLe.toLocaleDateString('fr-FR'),
    daysRemaining: joursRestants,
    matomoCampaignId: 'nouveau_j90',
    ...profilDuCourriel(destinataire.profil),
  })
