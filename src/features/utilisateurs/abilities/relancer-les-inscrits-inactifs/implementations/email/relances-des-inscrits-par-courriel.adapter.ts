import { coordinateurDe, mediateurDe } from '@/features/utilisateurs/domain'
import {
  type EchecTechnique,
  enEchecTechnique,
  failure,
  type Result,
  success,
} from '@/libraries/result'
import type { RelancerLesInscritsInactifsPorts } from '../../domain'
import { envoyerBienDemarrer } from './envoyer-bien-demarrer.mutation'
import { envoyerLAvertissementDeSuppression } from './envoyer-l-avertissement-de-suppression.mutation'
import { envoyerLaRelance } from './envoyer-la-relance.mutation'
import { envoyerLaSuppressionDuCompte } from './envoyer-la-suppression-du-compte.mutation'

const attraper = async (
  envoi: () => Promise<void>,
): Promise<Result<void, EchecTechnique>> => {
  try {
    await envoi()
    return success(undefined)
  } catch (erreur) {
    return failure(enEchecTechnique(erreur))
  }
}

const dateFrancaise = (date: Date): string => date.toLocaleDateString('fr-FR')

export const relancesDesInscritsParCourriel = (
  totalInscrits: number,
): Pick<
  RelancerLesInscritsInactifsPorts,
  'envoyerLaRelance' | 'envoyerLAvertissement' | 'envoyerLAvisDEffacement'
> => ({
  envoyerLaRelance: (destinataire, relance) =>
    attraper(() =>
      relance._tag === 'BienDemarrer'
        ? envoyerBienDemarrer({
            email: destinataire.courriel,
            firstname: destinataire.prenom,
            matomoCampaignId: `nouveau_j${relance.palier}`,
            isMediateur: mediateurDe(destinataire.rattachements) !== null,
            isCoordinateur: coordinateurDe(destinataire.rattachements) !== null,
          })
        : envoyerLaRelance({
            email: destinataire.courriel,
            firstname: destinataire.prenom,
            totalUsers: totalInscrits,
            matomoCampaignId: `nouveau_j${relance.palier}`,
            isMediateur: mediateurDe(destinataire.rattachements) !== null,
            isCoordinateur: coordinateurDe(destinataire.rattachements) !== null,
            monthsCount: relance.moisDepuisLInscription,
          }),
    ),
  envoyerLAvertissement: (destinataire, echeance) =>
    attraper(() =>
      envoyerLAvertissementDeSuppression({
        email: destinataire.courriel,
        firstname: destinataire.prenom,
        deletionDate: dateFrancaise(echeance.suppressionLe),
        daysRemaining: echeance.joursRestants,
        matomoCampaignId: 'nouveau_j90',
        isMediateur: mediateurDe(destinataire.rattachements) !== null,
        isCoordinateur: coordinateurDe(destinataire.rattachements) !== null,
      }),
    ),
  envoyerLAvisDEffacement: (destinataire) =>
    attraper(() =>
      envoyerLaSuppressionDuCompte({
        email: destinataire.courriel,
        isMediateur: mediateurDe(destinataire.rattachements) !== null,
      }),
    ),
})
