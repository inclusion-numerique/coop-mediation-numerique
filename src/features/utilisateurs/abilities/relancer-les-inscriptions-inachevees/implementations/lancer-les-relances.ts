import { compterLesInscrits } from '@/features/utilisateurs/db/compter-les-inscrits.query'
import type { RetirerDuRegistre } from '@/features/utilisateurs/db/registre-des-personnes'
import { removeBrevoUserContact } from '@/features/utilisateurs/implementations/brevo/removeBrevoUserContact'
import { relancerLesInscriptionsInachevees } from '../commands/relancer-les-inscriptions-inachevees'
import type { RelancerLesInscriptionsInacheveesPorts } from '../domain'
import {
  sendAccountDeletedEmail,
  sendDeletionWarningEmail,
  sendFinishYourSignupEmail,
} from './email'
import { effacerLInscription } from './prisma'

const dateFrancaise = (date: Date): string => date.toLocaleDateString('fr-FR')

const relancesDInscriptionPorts = (
  totalInscrits: number,
  retirerDuRegistre: RetirerDuRegistre,
): RelancerLesInscriptionsInacheveesPorts => ({
  envoyerLaRelance: ({ courriel, prenom }, palier) =>
    sendFinishYourSignupEmail({
      email: courriel,
      firstname: prenom,
      totalUsers: totalInscrits,
      matomoCampaignId: `finaliser_inscription_j${palier}`,
    }),
  envoyerLAvertissement: ({ courriel, prenom }, echeance) =>
    sendDeletionWarningEmail({
      email: courriel,
      firstname: prenom,
      deletionDate: dateFrancaise(echeance.suppressionLe),
      daysRemaining: echeance.joursRestants,
      matomoCampaignId: 'finaliser_inscription_j90',
    }),
  envoyerLAvisDEffacement: ({ courriel, prenom }) =>
    sendAccountDeletedEmail({ email: courriel, firstname: prenom }),
  effacerLInscription: effacerLInscription(retirerDuRegistre),
  retirerDesListes: async (courriel) => {
    await removeBrevoUserContact(courriel)
  },
})

export const lancerLesRelancesDInscription = async (
  maintenant: Date,
  retirerDuRegistre: RetirerDuRegistre,
) =>
  relancerLesInscriptionsInachevees({
    maintenant,
    ports: relancesDInscriptionPorts(
      await compterLesInscrits(),
      retirerDuRegistre,
    ),
  })
