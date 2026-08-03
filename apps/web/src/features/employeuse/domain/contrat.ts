import type { EmployeuseId } from './employeuse-id'
import type { PeriodeEmploi } from './periode-emploi'

/**
 * Contrat rattachant une personne à une employeuse. Seule source de dates
 * d'emploi depuis l'ADR-002 (`coop.employes_structures.debut_emploi`/`fin_emploi`
 * ont été abandonnés : artefacts d'inscription pour l'essentiel).
 *
 * Invariant posé à la frontière : **au plus un contrat par employeuse**. Quand
 * la base en porte plusieurs, c'est `contratPourEmployeuse` qui tranche, une
 * fois, au moment du transfert — le domaine n'a pas à rejouer l'arbitrage à
 * chaque lecture.
 */
export type Contrat = {
  readonly employeuseId: EmployeuseId
  readonly periode: PeriodeEmploi
}

/**
 * Contrat le plus pertinent pour une employeuse : celui qui la cible, en
 * préférant la date de début la plus récente.
 *
 * Primitive basse altitude, générique sur la ligne : elle sert le transfer de
 * cette feature comme les projections qui portent encore leur propre `select`
 * (api/v1, historique admin) et n'ont pas de `Contrat` brandé à lui donner.
 * Elle reste l'unique source de vérité de la règle — le reste du domaine en
 * dérive plutôt que de la réimplémenter.
 */
export const contratPourEmployeuse = <
  Ligne extends { structureId: number | null; dateDebut: Date | null },
>(
  contrats: readonly Ligne[],
  employeuseId: number,
): Ligne | null =>
  contrats
    .filter((contrat) => contrat.structureId === employeuseId)
    .toSorted(
      (a, b) => (b.dateDebut?.getTime() ?? 0) - (a.dateDebut?.getTime() ?? 0),
    )
    .at(0) ?? null
