import { removeBrevoUserContact } from '@/features/utilisateurs/implementations/brevo/remove-brevo-user-contact.mutation'
import { compterLesInscrits } from '@/features/utilisateurs/implementations/prisma/compter-les-inscrits.query'
import { noterLaRelance } from '@/features/utilisateurs/implementations/prisma/noter-la-relance.mutation'
import type { RetirerDuRegistre } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import type { RelancerLesInscriptionsInacheveesPorts } from '../domain'
import { relancerLesInscriptionsInachevees } from '../domain/relancer-les-inscriptions-inachevees'
import {
  envoyerLAvertissementDeSuppression,
  envoyerLaRelance,
  envoyerLaSuppressionDuCompte,
} from './email'
import { effacerLInscription } from './prisma'
import { inscriptionsInachevees } from './prisma/inscriptions-inachevees.query'

const dateFrancaise = (date: Date): string => date.toLocaleDateString('fr-FR')

const relancesDInscriptionPorts = (
  totalInscrits: number,
  retirerDuRegistre: RetirerDuRegistre,
): RelancerLesInscriptionsInacheveesPorts => ({
  lireLesComptesARelancer: inscriptionsInachevees,
  noterLaRelance: noterLaRelance('Inscription'),
  envoyerLaRelance: ({ courriel, prenom }, palier) =>
    envoyerLaRelance({
      email: courriel,
      firstname: prenom,
      totalUsers: totalInscrits,
      matomoCampaignId: `finaliser_inscription_j${palier}`,
    }),
  envoyerLAvertissement: ({ courriel, prenom }, echeance) =>
    envoyerLAvertissementDeSuppression({
      email: courriel,
      firstname: prenom,
      deletionDate: dateFrancaise(echeance.suppressionLe),
      daysRemaining: echeance.joursRestants,
      matomoCampaignId: 'finaliser_inscription_j90',
    }),
  envoyerLAvisDEffacement: ({ courriel, prenom }) =>
    envoyerLaSuppressionDuCompte({ email: courriel, firstname: prenom }),
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
