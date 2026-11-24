import type { Acteur, Portee } from '../../domain'
import { nomDeLEquipe } from './nom-de-l-equipe.presenter'

export type EquipeAffichee = {
  readonly numero: number
  readonly coordonneePar: string
}

export const equipeAffichee =
  (acteur: Acteur) =>
  (portee: Portee): EquipeAffichee | null => {
    if (portee._tag !== 'Equipe' || acteur.equipes.length <= 1) return null

    const trouvee = acteur.equipes
      .map((equipe, index) => ({ equipe, numero: index + 1 }))
      .find(({ equipe }) => equipe.coordinateurId === portee.coordinateurId)

    return trouvee === undefined
      ? null
      : {
          numero: trouvee.numero,
          coordonneePar: nomDeLEquipe(acteur, trouvee.equipe),
        }
  }
