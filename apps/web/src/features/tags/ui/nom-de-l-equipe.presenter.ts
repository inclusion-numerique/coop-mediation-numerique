import type { Acteur, Equipe } from '../domain'

export const nomDeLEquipe = (acteur: Acteur, equipe: Equipe): string => {
  if (equipe.coordonneePar !== null) return equipe.coordonneePar
  return equipe.coordinateurId === acteur.coordinateurId
    ? 'Mon équipe'
    : 'Équipe'
}
