import type { CodeDepartement } from '@app/web/libraries/departement'
import type { CoordinateurId } from './coordinateur-id'
import type { MediateurId } from './mediateur-id'
import type { NomDuCoordinateur } from './nom-du-coordinateur'

export type Equipe = {
  readonly coordinateurId: CoordinateurId
  readonly coordonneePar: NomDuCoordinateur
}

export type Acteur = {
  readonly mediateurId: MediateurId | null
  readonly coordinateurId: CoordinateurId | null
  readonly equipes: readonly Equipe[]
  readonly departement: CodeDepartement | null
}

export const equipeDe =
  (acteur: Acteur) =>
  (coordinateurId: CoordinateurId): Equipe | null =>
    acteur.equipes.find((equipe) => equipe.coordinateurId === coordinateurId) ??
    null
