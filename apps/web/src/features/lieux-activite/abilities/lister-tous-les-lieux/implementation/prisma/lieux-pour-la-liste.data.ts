import type { DataTableConfiguration } from '@app/web/libs/data-table/DataTableConfiguration'
import type { Prisma } from '@prisma/client'
import type { LieuDeLaListe } from './lieux-pour-la-liste.query'

/**
 * La forme d'une configuration de tableau pour les lieux.
 *
 * `libs/data-table` demande à un seul objet de décrire à la fois l'affichage
 * d'une colonne et le tri qu'elle déclenche en base : ses `orderBy` sont des
 * fragments de requête. Le type vit donc ici, avec la requête qu'il décrit, et
 * l'écran s'y conforme sans avoir à connaître Prisma.
 *
 * La configuration elle-même reste dans `ui/` : ce sont les cellules, les
 * en-têtes et les colonnes du CSV. Tant que la bibliothèque n'aura pas séparé
 * les deux, elle continuera d'y écrire quelques `orderBy`.
 */
export type LieuxDataTableConfiguration = DataTableConfiguration<
  LieuDeLaListe,
  Prisma.LieuInclusionWhereInput,
  Prisma.LieuInclusionOrderByWithRelationInput
>
