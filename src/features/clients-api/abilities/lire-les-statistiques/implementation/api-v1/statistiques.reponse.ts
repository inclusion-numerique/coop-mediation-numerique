import { apiV1Url } from '@/libraries/json-api/apiV1Url'
import type {
  JsonApiItemResponse,
  JsonApiResource,
} from '@/libraries/json-api/JsonApiTypes'
import { serializeApiRequestParams } from '@/libraries/json-api/serializeApiRequestParams'

type StatistiqueResource<TAttributes extends object> = JsonApiResource<
  'statistiques',
  TAttributes,
  never
>

export type StatistiquesResponse<TAttributes extends object> =
  JsonApiItemResponse<StatistiqueResource<TAttributes>>

const lienDesStatistiques = (requete: string): string =>
  apiV1Url(requete.length > 0 ? `/statistiques?${requete}` : '/statistiques')

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
