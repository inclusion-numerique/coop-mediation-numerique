import { getServerBaseUrl } from '@/configuration/projet/base-url'
import type { FiltreDeDates } from '@/features/clients-api/implementations/api-v1'
import { encodeSerializableState } from '@/libraries/etat-encode/encode-serializable-state'
import { apiV1Url } from '@/libraries/json-api/api-v1-url'
import {
  createCompositeCursor,
  defaultJsonApiCursorPaginationSize,
} from '@/libraries/json-api/cursor-pagination'
import type {
  JsonApiListResponse,
  JsonApiResource,
} from '@/libraries/json-api/json-api-types'
import {
  type CurseurDePage,
  type PaginationParCurseur,
  pageParCurseur,
} from '@/libraries/json-api/page-par-curseur'

type ActiviteRelationships = 'mediateur'

type ActiviteResource<TAttributes extends object> = JsonApiResource<
  'activite',
  TAttributes,
  ActiviteRelationships
>

export type ActiviteListResponse<TAttributes extends object> =
  JsonApiListResponse<ActiviteResource<TAttributes>>

export const parametresDeLaPage = ({
  take,
  creationDepuis,
  modificationDepuis,
}: {
  take: number
  creationDepuis: string | undefined
  modificationDepuis: string | undefined
}): [string, string][] => [
  ...(take === defaultJsonApiCursorPaginationSize
    ? []
    : [['page[size]', String(Math.abs(take))] satisfies [string, string]]),
  ...(creationDepuis
    ? [['filter[creation][depuis]', creationDepuis] satisfies [string, string]]
    : []),
  ...(modificationDepuis
    ? [
        ['filter[modification][depuis]', modificationDepuis] satisfies [
          string,
          string,
        ],
      ]
    : []),
]

const lienDesActivites =
  (parametres: [string, string][]) => (cursor?: CurseurDePage) =>
    apiV1Url(
      getServerBaseUrl(),
      '/activites',
      new URLSearchParams([
        ...parametres,
        ...(cursor
          ? [
              [
                `page[${cursor.direction}]`,
                encodeSerializableState(cursor.value),
              ] satisfies [string, string],
            ]
          : []),
      ]),
    )

const curseurDeLActivite = ({
  modification,
  id,
}: {
  modification: Date
  id: string
}): string => createCompositeCursor(modification.toISOString(), id)

export const reponseDesActivites = <
  TActivite extends { readonly id: string; readonly modification: Date },
  TAttributes extends object,
>({
  activites,
  total,
  pagination,
  curseur,
  filtre,
  attributs,
}: {
  activites: readonly TActivite[]
  total: number
  pagination: PaginationParCurseur
  curseur: string[] | undefined
  filtre: FiltreDeDates
  attributs: (activite: TActivite) => TAttributes
}): ActiviteListResponse<TAttributes> => {
  const derniere = activites.at(-1)
  const premiere = activites.at(0)

  return pageParCurseur({
    data: activites.map((activite) => ({
      type: 'activite' as const,
      id: activite.id,
      attributes: attributs(activite),
    })),
    total,
    pagination,
    suivant: derniere ? curseurDeLActivite(derniere) : undefined,
    precedent: curseur && premiere ? curseurDeLActivite(premiere) : undefined,
    lien: lienDesActivites(
      parametresDeLaPage({
        take: pagination.take,
        creationDepuis: filtre.creation.depuis,
        modificationDepuis: filtre.modification.depuis,
      }),
    ),
  })
}
