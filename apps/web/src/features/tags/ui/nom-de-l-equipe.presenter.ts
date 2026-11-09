import { type Acteur, coordinateurDe, type Equipe } from '../domain'

export const nomDeLEquipe = (acteur: Acteur, equipe: Equipe): string => {
  if (equipe.coordonneePar !== null) return equipe.coordonneePar
  return equipe.coordinateurId === coordinateurDe(acteur)
    ? 'Mon équipe'
    : 'Équipe'
}
