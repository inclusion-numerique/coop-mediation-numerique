import { contactEmail } from '@/configuration/projet'
import {
  emailTransport,
  expediteur,
  throwOnSendMailFailure,
} from '@/configuration/smtp'
import { relance } from '@/features/utilisateurs/abilities/relancer-les-inscrits-inactifs/implementations/email/relance.email'
import { coordinateurDe, mediateurDe } from '@/features/utilisateurs/domain'
import { compileMjml } from '@/libraries/emails/rendu'
import { attraperEnEchecTechnique } from '@/libraries/result'
import type { EnvoyerLaRelanceDuCompte } from '../../domain'

const envoyer = async ({
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

export const envoyerLaRelanceDuCompte =
  (totalInscrits: number): EnvoyerLaRelanceDuCompte =>
  (destinataire, { palier, moisDepuisLInscription }) =>
    attraperEnEchecTechnique(envoyer)({
      email: destinataire.courriel,
      firstname: destinataire.prenom,
      totalUsers: totalInscrits,
      matomoCampaignId: `nouveau_j${palier}`,
      isMediateur: mediateurDe(destinataire.rattachements) !== null,
      isCoordinateur: coordinateurDe(destinataire.rattachements) !== null,
      monthsCount: moisDepuisLInscription,
    })
