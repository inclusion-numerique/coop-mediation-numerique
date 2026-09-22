export {
  type Anomalie,
  diagnostiquer,
  type Gravite,
  LISTES,
  type LigneAAuditer,
} from './domain'
export {
  type AnomalieSituee,
  auditerLesDonnees,
  type Poste,
  type Releve,
} from './domain/auditer-les-donnees'
export { listesATrier } from './domain/listes-a-trier'
export { lieuxAAuditer, trierLesListes } from './implementation'
