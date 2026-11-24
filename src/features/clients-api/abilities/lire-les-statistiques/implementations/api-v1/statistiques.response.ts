import { getServerBaseUrl } from '@/configuration/projet/base-url'
import { apiV1Url } from '@/libraries/json-api/api-v1-url'
import type {
  JsonApiItemResponse,
  JsonApiResource,
} from '@/libraries/json-api/json-api-types'
import { serializeApiRequestParams } from '@/libraries/json-api/serialize-api-request-params'

type StatistiqueResource<TAttributes extends object> = JsonApiResource<
  'statistiques',
  TAttributes,
  never
>

export type StatistiquesResponse<TAttributes extends object> =
  JsonApiItemResponse<StatistiqueResource<TAttributes>>

const lienDesStatistiques = (requete: string): string =>
  apiV1Url(
    getServerBaseUrl(),
    requete.length > 0 ? `/statistiques?${requete}` : '/statistiques',
  )

export const reponseDesStatistiques = <TAttributes extends object>({
  attributes,
  queryParams,
}: {
  attributes: TAttributes
  queryParams: Record<string, unknown>
}): StatistiquesResponse<TAttributes> => ({
  data: {
    type: 'statistiques',
    id: 'statistiques',
    attributes,
  },
  links: {
    self: { href: lienDesStatistiques(serializeApiRequestParams(queryParams)) },
  },
  meta: {},
})
