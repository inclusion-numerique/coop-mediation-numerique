import { coordinateurDe, mediateurDe } from '@/features/utilisateurs/domain'
import { compterLesInscrits } from '@/features/utilisateurs/implementations/prisma/compter-les-inscrits.query'
import { noterLaRelance } from '@/features/utilisateurs/implementations/prisma/noter-la-relance.mutation'
import type { RelancerLesInscritsInactifsPorts } from '../domain'
import { relancerLesInscritsInactifs } from '../domain/relancer-les-inscrits-inactifs'
import {
  sendGettingStartedEmail,
  sendNouveauAccountDeletedEmail,
  sendNouveauAccountDeletionWarningEmail,
  sendNouveauAccountEmail,
} from './email'
import { inscritsSansProduction } from './prisma/inscrits-sans-production.query'

const dateFrancaise = (date: Date): string => date.toLocaleDateString('fr-FR')

const relancesDesInscritsPorts = (
  totalInscrits: number,
  supprimerLeCompte: RelancerLesInscritsInactifsPorts['supprimerLeCompte'],
): RelancerLesInscritsInactifsPorts => ({
  lireLesComptesARelancer: inscritsSansProduction,
  noterLaRelance: noterLaRelance('Nouveau'),
  envoyerLaRelance: (destinataire, palier) =>
    palier === 7
      ? sendGettingStartedEmail({
          email: destinataire.courriel,
          firstname: destinataire.prenom,
          matomoCampaignId: 'nouveau_j7',
          isMediateur: mediateurDe(destinataire.rattachements) !== null,
          isCoordinateur: coordinateurDe(destinataire.rattachements) !== null,
        })
      : sendNouveauAccountEmail({
          email: destinataire.courriel,
          firstname: destinataire.prenom,
          totalUsers: totalInscrits,
          matomoCampaignId: `nouveau_j${palier}`,
          isMediateur: mediateurDe(destinataire.rattachements) !== null,
          isCoordinateur: coordinateurDe(destinataire.rattachements) !== null,
          monthsCount: palier === 30 ? 1 : 2,
        }),
  envoyerLAvertissement: (destinataire, echeance) =>
    sendNouveauAccountDeletionWarningEmail({
      email: destinataire.courriel,
      firstname: destinataire.prenom,
      deletionDate: dateFrancaise(echeance.suppressionLe),
      daysRemaining: echeance.joursRestants,
      matomoCampaignId: 'nouveau_j90',
      isMediateur: mediateurDe(destinataire.rattachements) !== null,
      isCoordinateur: coordinateurDe(destinataire.rattachements) !== null,
    }),
  envoyerLAvisDEffacement: (destinataire) =>
    sendNouveauAccountDeletedEmail({
      email: destinataire.courriel,
      isMediateur: mediateurDe(destinataire.rattachements) !== null,
    }),
  supprimerLeCompte,
})

export const lancerLesRelancesDesInscrits = async (
  maintenant: Date,
  supprimerLeCompte: RelancerLesInscritsInactifsPorts['supprimerLeCompte'],
) =>
  relancerLesInscritsInactifs({
    maintenant,
    ports: relancesDesInscritsPorts(
      await compterLesInscrits(),
      supprimerLeCompte,
    ),
  })
