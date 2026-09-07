import type { SortReferential } from '@app/web/libs/data-table/getDataTableOrderBy'
import type { Prisma } from '@prisma/client'
import type { ColonneTriable } from '../../ui/LieuxDataTable'

/**
 * Comment trier la liste des lieux, colonne par colonne.
 *
 * L'écran nomme les colonnes qu'il rend triables ; c'est ici, avec la requête,
 * qu'on sait sur quoi elles se trient. Le type annoté rend le référentiel
 * exact : une colonne triable sans règle, ou une règle sans colonne, ne
 * compilent pas. Annoté plutôt que `satisfies`, parce que c'est lui que la
 * route lit pour résoudre le tri — et non ce que la première entrée laisse
 * deviner.
 *
 * Seul un type est emprunté à l'écran, et il s'efface à la compilation : rien
 * ici ne fait entrer un composant dans une lecture de base.
 */
export const triDesLieux: SortReferential<
  ColonneTriable,
  Prisma.LieuInclusionOrderByWithRelationInput
> = {
  nom: (direction) => [{ nom: direction }],
  creation: (direction) => [{ creation: direction }],
  modification: (direction) => [{ modification: direction }],
  mediateursEnActivite: (direction) => [
    { mediateursEnActivite: { _count: direction } },
  ],
}
