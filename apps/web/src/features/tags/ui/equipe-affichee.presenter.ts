import type { Acteur, Portee } from '../domain'
import type { EquipeAffichee } from './tag-affiche'

export const equipeAffichee =
  (acteur: Acteur) =>
  (portee: Portee): EquipeAffichee | null => {
    if (portee._tag !== 'Equipe' || acteur.equipes.length <= 1) return null

    const index = acteur.equipes.findIndex(
      ({ coordinateurId }) => coordinateurId === portee.coordinateurId,
    )

    return index < 0
      ? null
      : {
          numero: index + 1,
          coordonneePar: acteur.equipes[index].coordonneePar,
        }
  }
