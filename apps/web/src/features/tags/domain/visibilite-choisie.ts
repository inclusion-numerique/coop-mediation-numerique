import type { Acteur } from './acteur'
import type { CoordinateurId } from './coordinateur-id'
import type { Portee } from './portee'

export type VisibiliteChoisie =
  | { readonly _tag: 'Personnel' }
  | { readonly _tag: 'Equipe'; readonly coordinateurId: CoordinateurId }
  | { readonly _tag: 'Departemental' }

export const porteeChoisie = (
  acteur: Acteur,
  visibilite: VisibiliteChoisie,
): Portee | null => {
  if (visibilite._tag === 'Personnel') {
    if (acteur.mediateurId !== null)
      return {
        _tag: 'Personnel',
        proprietaire: { _tag: 'Mediateur', mediateurId: acteur.mediateurId },
      }
    if (acteur.coordinateurId !== null)
      return {
        _tag: 'Personnel',
        proprietaire: {
          _tag: 'Coordinateur',
          coordinateurId: acteur.coordinateurId,
        },
      }
    return null
  }

  if (visibilite._tag === 'Equipe')
    return acteur.coordinateurId === visibilite.coordinateurId ||
      acteur.equipes.some(
        ({ coordinateurId }) => coordinateurId === visibilite.coordinateurId,
      )
      ? { _tag: 'Equipe', coordinateurId: visibilite.coordinateurId }
      : null

  return acteur.coordinateurId !== null && acteur.departement !== null
    ? { _tag: 'Departemental', departement: acteur.departement }
    : null
}
