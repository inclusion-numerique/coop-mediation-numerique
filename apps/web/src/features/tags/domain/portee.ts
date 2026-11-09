import type { CodeDepartement } from '@app/web/libraries/departement'
import type { CoordinateurId } from './coordinateur-id'
import type { MediateurId } from './mediateur-id'

export type Proprietaire =
  | { readonly _tag: 'Mediateur'; readonly mediateurId: MediateurId }
  | { readonly _tag: 'Coordinateur'; readonly coordinateurId: CoordinateurId }

export type Portee =
  | { readonly _tag: 'Personnel'; readonly proprietaire: Proprietaire }
  | { readonly _tag: 'Equipe'; readonly coordinateurId: CoordinateurId }
  | { readonly _tag: 'Departemental'; readonly departement: CodeDepartement }
  | { readonly _tag: 'National' }

export type TypeDePortee = Portee['_tag']

const ETENDUE: Record<TypeDePortee, number> = {
  Personnel: 1,
  Equipe: 2,
  Departemental: 3,
  National: 4,
}

export const auMoinsAussiLarge = (
  destination: TypeDePortee,
  source: TypeDePortee,
): boolean => ETENDUE[destination] >= ETENDUE[source]
