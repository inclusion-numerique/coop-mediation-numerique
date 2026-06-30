import type { InscriptionStep } from '@app/web/features/inscription/domain'

/**
 * Mapping étape → URL de la route correspondante. Concern de routage (UI), gardé
 * hors du `domain/` qui reste pur. Table déclarative (`Map`) : `.get` accepte la
 * valeur brandée sans indexation typée fragile.
 */
const stepPaths = new Map<string, string>([
  ['initialize', '/inscription/initialiser'],
  ['choisir-role', '/inscription/choisir-role'],
  ['verifier-informations', '/inscription/verifier-informations'],
  [
    'renseigner-structure-employeuse',
    '/inscription/renseigner-structure-employeuse',
  ],
  ['lieux-activite', '/inscription/lieux-activite'],
  ['recapitulatif', '/inscription/recapitulatif'],
])

export const stepPath = (step: InscriptionStep): string =>
  stepPaths.get(step) ?? '/inscription'
