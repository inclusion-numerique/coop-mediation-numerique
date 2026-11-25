import { getServerBaseUrl } from '@/configuration/projet/serveur'
import type { JsonApiListResponse, JsonApiResource } from '@/libraries/json-api'
import {
  cursorPageHref,
  type PaginationParCurseur,
  pageParCurseur,
} from '@/libraries/json-api'

type CraV1Relationships = 'user'

type CraV1Resource<TAttributes extends object> = JsonApiResource<
  'craV1',
  TAttributes,
  CraV1Relationships
>

export type CraV1ListResponse<TAttributes extends object> = JsonApiListResponse<
  CraV1Resource<TAttributes>
>

export const reponseDesCrasV1 = <
  TCra extends { readonly id: string; readonly createdAt: Date },
  TAttributes extends object,
>({
  cras,
  total,
  pagination,
  attributs,
}: {
  cras: readonly TCra[]
  total: number
  pagination: PaginationParCurseur
  attributs: (cra: TCra) => TAttributes
}): CraV1ListResponse<TAttributes> =>
  pageParCurseur({
    data: cras.map((cra) => ({
      type: 'craV1' as const,
      id: cra.id,
      attributes: attributs(cra),
    })),
    total,
    pagination,
    suivant: cras.at(-1)?.createdAt.toISOString(),
    precedent: cras.at(0)?.createdAt.toISOString(),
    lien: (cursor) =>
      cursorPageHref(getServerBaseUrl(), '/archives-v1/cras', { cursor }),
  })
