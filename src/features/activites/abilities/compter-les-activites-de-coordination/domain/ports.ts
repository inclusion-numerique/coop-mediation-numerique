import type { CoordinateurId } from '../../../domain'
import type { ActiviteADecompter } from './activites-de-coordination'

export type ActivitesDuCoordinateur = (
  coordinateurId: CoordinateurId,
) => Promise<readonly ActiviteADecompter[]>

export type CompterLesActivitesDeCoordinationPorts = {
  readonly activitesDuCoordinateur: ActivitesDuCoordinateur
}
