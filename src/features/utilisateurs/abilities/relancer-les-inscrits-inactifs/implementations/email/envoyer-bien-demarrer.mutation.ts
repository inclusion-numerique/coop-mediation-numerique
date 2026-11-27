import { contactEmail } from '@/configuration/projet'
import {
  emailTransport,
  expediteur,
  throwOnSendMailFailure,
} from '@/configuration/smtp'
import { bienDemarrer } from '@/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/implementations/email/bien-demarrer.email'
import { compileMjml } from '@/libraries/emails/rendu'
import { attraperEnEchecTechnique } from '@/libraries/result'
import type { EnvoyerBienDemarrer } from '../../domain'
import { profilDuCourriel } from './profil-du-destinataire.transfer'

const envoyer = async ({
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
    replyTo: contactEmail(),
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

export const envoyerBienDemarrer: EnvoyerBienDemarrer = (
  destinataire,
  { palier },
) =>
  attraperEnEchecTechnique(envoyer)({
    email: destinataire.courriel,
    firstname: destinataire.prenom,
    matomoCampaignId: `nouveau_j${palier}`,
    ...profilDuCourriel(destinataire.profil),
  })
