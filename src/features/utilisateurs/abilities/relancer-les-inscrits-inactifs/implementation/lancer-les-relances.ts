import { compterLesInscrits } from '@/features/utilisateurs/db/compter-les-inscrits.query'
import { coordinateurDe, mediateurDe } from '@/features/utilisateurs/domain'
import { relancerLesInscritsInactifs } from '../commands/relancer-les-inscrits-inactifs'
import type { RelancerLesInscritsInactifsPorts } from '../domain'
import {
  sendGettingStartedEmail,
  sendNouveauAccountDeletedEmail,
  sendNouveauAccountDeletionWarningEmail,
  sendNouveauAccountEmail,
} from './email'

const dateFrancaise = (date: Date): string => date.toLocaleDateString('fr-FR')

const relancesDesInscritsPorts = (
  totalInscrits: number,
  supprimerLeCompte: RelancerLesInscritsInactifsPorts['supprimerLeCompte'],
): RelancerLesInscritsInactifsPorts => ({
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
