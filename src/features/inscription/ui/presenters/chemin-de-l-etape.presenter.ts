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

export const cheminDeLEtape = (step: ValeurDEtapeDInscription) =>
  stepPaths[step]
