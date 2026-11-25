import { coordinateurDe, mediateurDe } from '@/features/utilisateurs/domain'
import type { RelancerLesInscritsInactifsPorts } from '../../domain'
import { envoyerBienDemarrer } from './envoyer-bien-demarrer.mutation'
import { envoyerLAvertissementDeSuppression } from './envoyer-l-avertissement-de-suppression.mutation'
import { envoyerLaRelance } from './envoyer-la-relance.mutation'
import { envoyerLaSuppressionDuCompte } from './envoyer-la-suppression-du-compte.mutation'

const dateFrancaise = (date: Date): string => date.toLocaleDateString('fr-FR')

export const relancesParCourriel = (
  totalInscrits: number,
): Pick<
  RelancerLesInscritsInactifsPorts,
  'envoyerLaRelance' | 'envoyerLAvertissement' | 'envoyerLAvisDEffacement'
> => ({
  envoyerLaRelance: (destinataire, palier) =>
    palier === 7
      ? envoyerBienDemarrer({
          email: destinataire.courriel,
          firstname: destinataire.prenom,
          matomoCampaignId: 'nouveau_j7',
          isMediateur: mediateurDe(destinataire.rattachements) !== null,
          isCoordinateur: coordinateurDe(destinataire.rattachements) !== null,
        })
      : envoyerLaRelance({
          email: destinataire.courriel,
          firstname: destinataire.prenom,
          totalUsers: totalInscrits,
          matomoCampaignId: `nouveau_j${palier}`,
          isMediateur: mediateurDe(destinataire.rattachements) !== null,
          isCoordinateur: coordinateurDe(destinataire.rattachements) !== null,
          monthsCount: palier === 30 ? 1 : 2,
        }),
  envoyerLAvertissement: (destinataire, echeance) =>
    envoyerLAvertissementDeSuppression({
      email: destinataire.courriel,
      firstname: destinataire.prenom,
      deletionDate: dateFrancaise(echeance.suppressionLe),
      daysRemaining: echeance.joursRestants,
      matomoCampaignId: 'nouveau_j90',
      isMediateur: mediateurDe(destinataire.rattachements) !== null,
      isCoordinateur: coordinateurDe(destinataire.rattachements) !== null,
    }),
  envoyerLAvisDEffacement: (destinataire) =>
    envoyerLaSuppressionDuCompte({
      email: destinataire.courriel,
      isMediateur: mediateurDe(destinataire.rattachements) !== null,
    }),
})
