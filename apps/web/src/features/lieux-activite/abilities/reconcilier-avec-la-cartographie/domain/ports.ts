import type { LieuCarto, LieuxCoopReunis } from './identifiant-composite'

/** Les lieux de la cartographie nationale qui citent au moins un lieu coop. */
export type LireLesLieuxCarto = () => Promise<readonly LieuCarto[]>

export type Reconciliation = {
  /** Liens remis à zéro avant de les reposer. */
  readonly liensReinitialises: number
  readonly lieuxRelies: number
  readonly rattachementsDedoublonnes: number
  readonly emploisDedoublonnes: number
}

/**
 * Repose les liens vers la cartographie et fusionne ce qu'elle a réuni. D'un
 * seul tenant : entre la remise à zéro et la repose, aucun lieu ne porte son
 * lien, et un incident laisserait la coop entièrement déliée.
 */
export type AppliquerLaReconciliation = (
  reunis: readonly LieuxCoopReunis[],
) => Promise<Reconciliation>
