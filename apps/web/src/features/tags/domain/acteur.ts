import type { CodeDepartement } from '@app/web/libraries/departement'
import type { CoordinateurId } from './coordinateur-id'
import type { MediateurId } from './mediateur-id'
import type { NomDuCoordinateur } from './nom-du-coordinateur'

export type Equipe = {
  readonly coordinateurId: CoordinateurId
  readonly coordonneePar: NomDuCoordinateur | null
}

export type Role =
  | { readonly _tag: 'Mediateur'; readonly mediateurId: MediateurId }
  | { readonly _tag: 'Coordinateur'; readonly coordinateurId: CoordinateurId }
  | {
      readonly _tag: 'MediateurEtCoordinateur'
      readonly mediateurId: MediateurId
      readonly coordinateurId: CoordinateurId
    }
  | { readonly _tag: 'SansRole' }

export type Acteur = Role & {
  readonly equipes: readonly Equipe[]
  readonly departement: CodeDepartement | null
}

export const role = (
  mediateurId: MediateurId | null,
  coordinateurId: CoordinateurId | null,
): Role => {
  if (mediateurId !== null && coordinateurId !== null)
    return { _tag: 'MediateurEtCoordinateur', mediateurId, coordinateurId }
  if (mediateurId !== null) return { _tag: 'Mediateur', mediateurId }
  if (coordinateurId !== null) return { _tag: 'Coordinateur', coordinateurId }
  return { _tag: 'SansRole' }
}

export const mediateurDe = (acteur: Role): MediateurId | null =>
  acteur._tag === 'Mediateur' || acteur._tag === 'MediateurEtCoordinateur'
    ? acteur.mediateurId
    : null

export const coordinateurDe = (acteur: Role): CoordinateurId | null =>
  acteur._tag === 'Coordinateur' || acteur._tag === 'MediateurEtCoordinateur'
    ? acteur.coordinateurId
    : null

export const equipeDe =
  (acteur: Acteur) =>
  (coordinateurId: CoordinateurId): Equipe | null =>
    acteur.equipes.find((equipe) => equipe.coordinateurId === coordinateurId) ??
    null
