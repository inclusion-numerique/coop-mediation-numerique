import type { Acteur } from './acteur'
import type { CoordinateurId } from './coordinateur-id'
import { auMoinsAussiLarge, type Portee, type Proprietaire } from './portee'
import type { Tag } from './tag'

const estDeSesEquipes = (
  acteur: Acteur,
  coordinateurId: CoordinateurId,
): boolean =>
  acteur.coordinateurId === coordinateurId ||
  acteur.equipes.some((equipe) => equipe.coordinateurId === coordinateurId)

const estLeProprietaire = (
  acteur: Acteur,
  proprietaire: Proprietaire,
): boolean =>
  proprietaire._tag === 'Mediateur'
    ? acteur.mediateurId === proprietaire.mediateurId
    : acteur.coordinateurId === proprietaire.coordinateurId

export const peutGerer =
  (acteur: Acteur) =>
  (portee: Portee): boolean => {
    if (portee._tag === 'Personnel')
      return estLeProprietaire(acteur, portee.proprietaire)
    if (portee._tag === 'Equipe')
      return estDeSesEquipes(acteur, portee.coordinateurId)
    if (portee._tag === 'Departemental')
      return (
        acteur.coordinateurId !== null &&
        acteur.departement === portee.departement
      )
    return false
  }

export const peutVoir =
  (acteur: Acteur) =>
  (portee: Portee): boolean => {
    if (portee._tag === 'Personnel')
      return estLeProprietaire(acteur, portee.proprietaire)
    if (portee._tag === 'Equipe')
      return estDeSesEquipes(acteur, portee.coordinateurId)
    if (portee._tag === 'Departemental')
      return acteur.departement === portee.departement
    return true
  }

export const peutFusionnerVers =
  (acteur: Acteur) =>
  (source: Tag, destination: Tag): boolean =>
    source.id !== destination.id &&
    peutGerer(acteur)(source.portee) &&
    peutVoir(acteur)(destination.portee) &&
    auMoinsAussiLarge(destination.portee._tag, source.portee._tag)
