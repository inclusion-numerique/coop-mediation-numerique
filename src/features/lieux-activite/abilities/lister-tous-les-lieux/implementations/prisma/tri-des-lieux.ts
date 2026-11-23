import type { SortDirection } from '@arckit/resultset'
import type { Prisma } from '@/generated/prisma/client'
import type { ColonneTriable } from '../../ui/presenters/lister-tous-les-lieux.search-params'

type OrdreDesLieux = Prisma.LieuInclusionOrderByWithRelationInput

const triDesLieux: Readonly<
  Record<ColonneTriable, (direction: SortDirection) => OrdreDesLieux[]>
> = {
  nom: (direction) => [{ nom: direction }],
  creation: (direction) => [{ creation: direction }],
  modification: (direction) => [{ modification: direction }],
  mediateursEnActivite: (direction) => [
    { mediateursEnActivite: { _count: direction } },
  ],
}

const estUneColonneTriable = (tri: string): tri is ColonneTriable =>
  Object.hasOwn(triDesLieux, tri)

export const ordreDesLieux = ({
  tri,
  ordre,
}: {
  tri?: string
  ordre?: string
}): OrdreDesLieux[] =>
  tri && estUneColonneTriable(tri)
    ? triDesLieux[tri](ordre === 'desc' ? 'desc' : 'asc')
    : []
