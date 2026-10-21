import type { Prisma } from '@app/web/generated/prisma/client'
import type { SortReferential } from '@app/web/libs/data-table/getDataTableOrderBy'
import type { ColonneTriable } from '../../ui/UtilisateursDataTable'

export const triDesUtilisateurs: SortReferential<
  ColonneTriable,
  Prisma.UserOrderByWithRelationInput
> = {
  creation: (direction) => [{ created: direction }],
  derniereConnexion: (direction) => [{ lastLogin: direction }],
  derniereVisite: (direction) => [{ lastSeen: direction }],
  nom: (direction) => [{ name: direction }],
  courriel: (direction) => [{ email: direction }],
  accompagnements: (direction) => [
    { mediateur: { accompagnementsCount: direction } },
  ],
  lieuxActivite: (direction) => [
    { mediateur: { enActivite: { _count: direction } } },
  ],
  beneficiaires: (direction) => [
    { mediateur: { beneficiairesCount: direction } },
  ],
}
