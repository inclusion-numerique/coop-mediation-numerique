import { compterLesInscrits } from '@/features/utilisateurs/db/compter-les-inscrits.query'
import { removeBrevoUserContact } from '@/features/utilisateurs/implementation/brevo/removeBrevoUserContact'
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
  effacerLInscription,
  retirerDesListes: async (courriel) => {
    await removeBrevoUserContact(courriel)
  },
})

export const lancerLesRelancesDInscription = async (maintenant: Date) =>
  relancerLesInscriptionsInachevees({
    maintenant,
    ports: relancesDInscriptionPorts(await compterLesInscrits()),
  })
