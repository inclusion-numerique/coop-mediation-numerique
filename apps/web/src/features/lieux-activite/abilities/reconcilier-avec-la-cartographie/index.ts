/**
 * Réconcilier les lieux de la coop avec la cartographie nationale.
 *
 * Cette ability n'a pas de scénarios Cucumber, à la différence de ses voisines :
 * son opération est globale — elle remet à zéro TOUS les liens vers la
 * cartographie avant de les reposer — quand les scénarios s'exécutent sur une
 * base qui porte les données de production et ne jugent que ce qu'ils ont semé.
 * Sa couverture est un test d'intégration Jest, qui travaille sur une base
 * vidée.
 */
export { reconcilierAvecLaCartographie } from './commands/reconcilier-avec-la-cartographie'
export type {
  LieuCarto,
  LieuxCoopReunis,
  Reconciliation,
} from './domain'
export {
  appliquerLaReconciliation,
  lireLesLieuxCarto,
} from './implementation'
