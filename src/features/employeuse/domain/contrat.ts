import type { Employeuse } from './employeuse'
import { debutEmploi, type PeriodeEmploi } from './periode-emploi'

/**
 * Contrat rattachant une personne à une employeuse. Seule source de dates
 * d'emploi depuis l'ADR-002 (`coop.employes_structures.debut_emploi`/`fin_emploi`
 * ont été abandonnés : artefacts d'inscription pour l'essentiel).
 *
 * Il porte l'employeuse elle-même, et pas seulement son identifiant : un contrat
 * passé désigne souvent une employeuse qui n'est plus dans les affectations
 * actives — c'est précisément ce qui permet de retrouver l'employeuse d'une date
 * révolue.
 */
export type Contrat = {
  readonly employeuse: Employeuse
  readonly periode: PeriodeEmploi
}

/**
 * Le plus récent d'une liste de contrats, au sens de la date de début.
 *
 * Générique sur la projection : la règle d'ordre est écrite une fois, et sert
 * aussi bien les `Contrat` du domaine que les lignes brutes des lectures qui
 * portent encore leur propre `select`.
 */
export const contratLePlusRecent = <T>(
  contrats: readonly T[],
  debutDe: (contrat: T) => Date | null,
): T | null =>
  contrats.toSorted(
    (a, b) => (debutDe(b)?.getTime() ?? 0) - (debutDe(a)?.getTime() ?? 0),
  )[0] ?? null

/**
 * Contrat le plus pertinent pour une employeuse, sur des lignes brutes.
 *
 * Primitive basse altitude conservée pour les projections qui n'ont pas de
 * `Contrat` brandé à donner (api/v1, historique admin) — elles s'aligneront
 * quand leur propre ability migrera.
 */
export const contratPourEmployeuse = <
  Ligne extends { structureId: number | null; dateDebut: Date | null },
>(
  contrats: readonly Ligne[],
  employeuseId: number,
): Ligne | null =>
  contratLePlusRecent(
    contrats.filter((contrat) => contrat.structureId === employeuseId),
    (contrat) => contrat.dateDebut,
  )

/** Contrat le plus pertinent d'une employeuse donnée, sur des contrats du domaine. */
export const contratDeLEmployeuse = (
  contrats: readonly Contrat[],
  employeuse: Employeuse,
): Contrat | null =>
  contratLePlusRecent(
    contrats.filter((contrat) => contrat.employeuse.id === employeuse.id),
    (contrat) => debutEmploi(contrat.periode),
  )
