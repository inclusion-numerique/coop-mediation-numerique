import type {
  ChoixDesDifferences,
  Difference,
} from '../../../domain/differences'
import type { Fiche } from '../../../domain/fiche'
import type { UtilisateurId } from '../../../domain/identifiants/utilisateur-id'
import type { Lieu } from '../../../domain/lieu'
import { ModifieParUtilisateur } from '../../../domain/registre/tracabilite'

export const resoudreLesDifferences = ({
  lieu,
  ficheCoop,
  ecarts,
  choix,
  par,
  maintenant,
}: {
  readonly lieu: Lieu
  readonly ficheCoop: Fiche
  readonly ecarts: readonly Difference[]
  readonly choix: ChoixDesDifferences
  readonly par: UtilisateurId
  readonly maintenant: Date
}): Lieu => ({
  ...lieu,
  fiche: ecarts.reduce<Fiche>(
    (resolue, { champ }) =>
      choix[champ] === 'coop'
        ? { ...resolue, [champ]: ficheCoop[champ] }
        : resolue,
    lieu.fiche,
  ),
  tracabilite: {
    ...lieu.tracabilite,
    derniereModification: ModifieParUtilisateur(maintenant, par),
  },
})
