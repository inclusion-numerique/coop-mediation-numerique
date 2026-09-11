import type { Fiche } from '../../../domain/fiche'
import type { Lieu } from '../../../domain/lieu'
import { ModifieParUtilisateur } from '../../../domain/tracabilite'
import type { UserId } from '../../../domain/user-id'
import type { ChoixDesDifferences, Difference } from './differences'

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
  readonly par: UserId
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
