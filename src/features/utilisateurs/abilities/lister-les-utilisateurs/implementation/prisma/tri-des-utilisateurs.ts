import type { SortDirection } from '@arckit/resultset'
import type { Prisma } from '@/generated/prisma/client'
import {
  type ColonneTriable,
  colonnesTriables,
  TRI_PAR_DEFAUT,
} from '../../domain'

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

const directionLue = (ordre?: string): SortDirection =>
  ordre === 'desc' ? 'desc' : 'asc'

const colonneLue = (tri: string): ColonneTriable | undefined =>
  colonnesTriables.find((colonne) => colonne === tri)

const ordreDeLaColonne = (
  colonne: ColonneTriable | undefined,
  ordre?: string,
): OrdreDesUtilisateurs =>
  colonne ? triDesUtilisateurs[colonne](directionLue(ordre)) : []

export const ordreDesUtilisateurs = ({
  tri,
  ordre,
}: {
  readonly tri?: string
  readonly ordre?: string
}): OrdreDesUtilisateurs =>
  tri
    ? ordreDeLaColonne(colonneLue(tri), ordre)
    : triDesUtilisateurs[TRI_PAR_DEFAUT.colonne](TRI_PAR_DEFAUT.ordre)
