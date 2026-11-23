// json:api links for pagination and resource-specific links
type JsonApiLink = {
  href: string
  meta?: JsonApiLinkMeta
}

type JsonApiLinkMeta = {
  [key: string]: unknown
}

type JsonApiLinks = {
  self?: JsonApiLink
  next?: JsonApiLink
  prev?: JsonApiLink
  related?: JsonApiLink
}

// json:api relationship structure
type JsonApiRelationshipData =
  | { type: string; id: string }
  | { type: string; id: string }[]

type JsonApiRelationship = {
  data: JsonApiRelationshipData
  links?: JsonApiLinks
  meta?: JsonApiRelationshipMeta
}

type JsonApiRelationshipMeta = {
  [key: string]: unknown
}

type JsonApiRelationships<T extends string> = {
  [K in T]: JsonApiRelationship
}

// json:api meta structure for lists and general purposes
export type JsonApiListMeta = {
  total_count: number
  items_per_page: number
  total_pages: number
  has_next_page: boolean
  has_prev_page: boolean
}

type JsonApiMeta = {
  [key: string]: unknown
}

// generic json:api resource
export type JsonApiResource<
  TType extends string,
  TAttributes extends object,
  TRelationships extends string = never,
  TLinks extends keyof JsonApiLinks = never,
> = {
  type: TType
  id: string
  attributes: TAttributes
  relationships?: JsonApiRelationships<TRelationships>
  links?: Pick<JsonApiLinks, TLinks>
  meta?: JsonApiMeta
}

// generic json:api response for lists
export type JsonApiListResponse<
  TResource extends JsonApiResource<string, object>,
> = {
  data: TResource[]
  links: JsonApiLinks
  meta: JsonApiListMeta
  included?: JsonApiResource<string, object>[]
}

export type JsonApiItemResponse<
  TResource extends JsonApiResource<string, object>,
> = {
  data: TResource
  links: JsonApiLinks
  meta: JsonApiMeta
}
