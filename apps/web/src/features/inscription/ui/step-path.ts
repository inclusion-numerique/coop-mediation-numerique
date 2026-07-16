import type {
  InscriptionStep,
  InscriptionStepValue,
} from '@app/web/features/inscription/domain'

const stepPaths: Record<InscriptionStepValue, string> = {
  initialize: '/inscription/initialiser',
  'choisir-role': '/inscription/choisir-role',
  'verifier-informations': '/inscription/verifier-informations',
  'renseigner-structure-employeuse':
    '/inscription/renseigner-structure-employeuse',
  'lieux-activite': '/inscription/lieux-activite',
  recapitulatif: '/inscription/recapitulatif',
}

export const stepPath = (step: InscriptionStep): string => {
  const value: InscriptionStepValue = step
  return stepPaths[value]
}
