import {
  type EchecTechnique,
  enEchecTechnique,
  failure,
  type Result,
  success,
} from '@/libraries/result'
import type { RelancerLesInscriptionsInacheveesPorts } from '../../domain'
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

export const relancesDInscriptionParCourriel = (
  totalInscrits: number,
): Pick<
  RelancerLesInscriptionsInacheveesPorts,
  'envoyerLaRelance' | 'envoyerLAvertissement' | 'envoyerLAvisDEffacement'
> => ({
  envoyerLaRelance: ({ courriel, prenom }, palier) =>
    attraper(() =>
      envoyerLaRelance({
        email: courriel,
        firstname: prenom,
        totalUsers: totalInscrits,
        matomoCampaignId: `finaliser_inscription_j${palier}`,
      }),
    ),
  envoyerLAvertissement: ({ courriel, prenom }, echeance) =>
    attraper(() =>
      envoyerLAvertissementDeSuppression({
        email: courriel,
        firstname: prenom,
        deletionDate: dateFrancaise(echeance.suppressionLe),
        daysRemaining: echeance.joursRestants,
        matomoCampaignId: 'finaliser_inscription_j90',
      }),
    ),
  envoyerLAvisDEffacement: ({ courriel, prenom }) =>
    attraper(() =>
      envoyerLaSuppressionDuCompte({ email: courriel, firstname: prenom }),
    ),
})
