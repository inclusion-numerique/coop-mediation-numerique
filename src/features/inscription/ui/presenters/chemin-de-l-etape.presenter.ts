import type { ValeurDEtapeDInscription } from '@/features/inscription/domain'

const stepPaths = {
  initialize: '/inscription/initialiser',
  'choisir-role': '/inscription/choisir-role',
  'verifier-informations': '/inscription/verifier-informations',
  'renseigner-structure-employeuse':
    '/inscription/renseigner-structure-employeuse',
  'lieux-activite': '/inscription/lieux-activite',
  recapitulatif: '/inscription/recapitulatif',
} as const satisfies Record<ValeurDEtapeDInscription, `/inscription/${string}`>

/**
 * Chemin d'URL d'une étape. Accepte la valeur brute (`InscriptionStepValue`) —
 * donc aussi une `InscriptionStep` brandée, structurellement assignable — pour
 * rester un drop-in du `getStepPath` legacy tant que le parcours n'est pas
 * entièrement migré.
 */
export const cheminDeLEtape = (step: ValeurDEtapeDInscription) =>
  stepPaths[step]
