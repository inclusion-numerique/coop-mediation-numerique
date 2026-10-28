import type { Acteur } from '../../../domain'

export type OptionDeVisibilite =
  | { readonly _tag: 'Personnel' }
  | {
      readonly _tag: 'Equipe'
      readonly coordinateurId: string
      readonly numero: number | null
      readonly coordonneePar: string
    }
  | { readonly _tag: 'Departemental' }

export const visibilitesProposees = (
  acteur: Acteur,
): readonly OptionDeVisibilite[] => [
  { _tag: 'Personnel' },
  ...acteur.equipes.map(
    ({ coordinateurId, coordonneePar }, index): OptionDeVisibilite => ({
      _tag: 'Equipe',
      coordinateurId,
      numero: acteur.equipes.length === 1 ? null : index + 1,
      coordonneePar,
    }),
  ),
  ...(acteur.coordinateurId !== null && acteur.departement !== null
    ? [{ _tag: 'Departemental' } as const]
    : []),
]

export const cleDeLaVisibilite = (
  visibilite:
    | { readonly _tag: 'Personnel' | 'Departemental' }
    | { readonly _tag: 'Equipe'; readonly coordinateurId: string },
): string =>
  visibilite._tag === 'Equipe'
    ? `Equipe:${visibilite.coordinateurId}`
    : visibilite._tag
