import type { Sort, SortDirection } from '@arckit/resultset'
import type { Prisma } from '@/generated/prisma/client'
import type { ColonneTriable } from '../../domain'

type OrdreDesUtilisateurs = readonly Prisma.UserOrderByWithRelationInput[]

const triDesUtilisateurs: Readonly<
  Record<ColonneTriable, (direction: SortDirection) => OrdreDesUtilisateurs>
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

export const ordreDesUtilisateurs = ({
  field,
  direction,
}: Sort<ColonneTriable>): OrdreDesUtilisateurs =>
  triDesUtilisateurs[field](direction)
