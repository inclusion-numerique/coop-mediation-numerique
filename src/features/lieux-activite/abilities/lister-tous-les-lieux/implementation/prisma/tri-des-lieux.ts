import type { Prisma } from '@app/web/generated/prisma/client'
import type { SortReferential } from '@app/web/libs/data-table/getDataTableOrderBy'
import type { ColonneTriable } from '../../ui/LieuxDataTable'

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
