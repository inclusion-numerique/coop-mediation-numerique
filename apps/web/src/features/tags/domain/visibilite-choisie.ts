import { type Acteur, coordinateurDe } from './acteur'
import type { CoordinateurId } from './coordinateur-id'
import type { Portee } from './portee'

export type VisibiliteChoisie =
  | { readonly _tag: 'Personnel' }
  | { readonly _tag: 'Equipe'; readonly coordinateurId: CoordinateurId }
  | { readonly _tag: 'Departemental' }

const porteePersonnelle = (acteur: Acteur): Portee | null => {
  if (acteur._tag === 'Mediateur' || acteur._tag === 'MediateurEtCoordinateur')
    return {
      _tag: 'Personnel',
      proprietaire: { _tag: 'Mediateur', mediateurId: acteur.mediateurId },
    }
  if (acteur._tag === 'Coordinateur')
    return {
      _tag: 'Personnel',
      proprietaire: {
        _tag: 'Coordinateur',
        coordinateurId: acteur.coordinateurId,
      },
    }
  return null
}

export const porteeChoisie = (
  acteur: Acteur,
  visibilite: VisibiliteChoisie,
): Portee | null => {
  if (visibilite._tag === 'Personnel') return porteePersonnelle(acteur)

  if (visibilite._tag === 'Equipe')
    return coordinateurDe(acteur) === visibilite.coordinateurId ||
      acteur.equipes.some(
        ({ coordinateurId }) => coordinateurId === visibilite.coordinateurId,
      )
      ? { _tag: 'Equipe', coordinateurId: visibilite.coordinateurId }
      : null

  return coordinateurDe(acteur) !== null && acteur.departement !== null
    ? { _tag: 'Departemental', departement: acteur.departement }
    : null
}
