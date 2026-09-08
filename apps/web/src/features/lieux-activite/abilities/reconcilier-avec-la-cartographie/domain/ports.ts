import type { LieuCarto, LieuxCoopReunis } from './identifiant-composite'

/** Les lieux de la cartographie nationale qui citent au moins un lieu coop. */
export type LireLesLieuxCarto = () => Promise<readonly LieuCarto[]>

export type Reconciliation = {
  readonly lieuxRelies: number
  readonly rattachementsDedoublonnes: number
  readonly emploisDedoublonnes: number
}

/**
 * Fusionne les lieux coop que la cartographie tient pour un seul, et note sur
 * les autres qu'une source extérieure les a touchés.
 *
 * Elle ne repose plus de lien vers la cartographie : l'identifiant vit dans
 * l'inscription au registre de l'Entrepôt, dont c'est le domicile, et la coop
 * n'en tient plus copie. La remise à zéro qui ouvrait le traitement — et qui
 * laissait la coop entièrement déliée en cas d'incident — disparaît avec elle.
 */
export type AppliquerLaReconciliation = (
  reunis: readonly LieuxCoopReunis[],
) => Promise<Reconciliation>
