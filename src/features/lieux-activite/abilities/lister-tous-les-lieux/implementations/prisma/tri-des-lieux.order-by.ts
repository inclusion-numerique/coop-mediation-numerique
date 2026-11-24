import type { SortDirection } from '@arckit/resultset'
import type { Prisma } from '@/generated/prisma/client'
import type {
  ColonneTriable,
  CriteresDeLaListe,
} from '../../domain/criteres-de-la-liste'

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

export const ordreDesLieux = ({
  field,
  direction,
}: CriteresDeLaListe['tri']): OrdreDesLieux[] => triDesLieux[field](direction)
