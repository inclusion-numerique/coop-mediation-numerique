import { getServerBaseUrl } from '@/configuration/projet/serveur'
import type { JsonApiListResponse, JsonApiResource } from '@/libraries/json-api'
import {
  createCompositeCursor,
  cursorPageHref,
  type PaginationParCurseur,
  pageParCurseur,
} from '@/libraries/json-api'

type StructureResource<TAttributes extends object> = JsonApiResource<
  'structure',
  TAttributes,
  never
>

export type StructureListResponse<TAttributes extends object> =
  JsonApiListResponse<StructureResource<TAttributes>>

export const requeteDesStructures = ({
  ids,
  creationDepuis,
  modificationDepuis,
}: {
  ids: string[]
  creationDepuis: string | undefined
  modificationDepuis: string | undefined
}): string =>
  new URLSearchParams([
    ...(ids.length > 0 ? [['ids', ids.join(',')]] : []),
    ...(creationDepuis ? [['filter[creation][depuis]', creationDepuis]] : []),
    ...(modificationDepuis
      ? [['filter[modification][depuis]', modificationDepuis]]
      : []),
  ]).toString()

const curseurDeLaStructure = ({
  creation,
  id,
}: {
  creation: Date
  id: string
}): string => createCompositeCursor(creation.toISOString(), id)

export const reponseDesStructures = <
  TLieu extends { readonly id: string; readonly creation: Date },
  TAttributes extends object,
>({
  lieux,
  total,
  pagination,
  curseur,
  requete,
  attributs,
}: {
  lieux: readonly TLieu[]
  total: number
  pagination: PaginationParCurseur
  curseur: string[] | undefined
  requete: {
    ids: string[]
    filter: {
      creation: { depuis?: string | undefined }
      modification: { depuis?: string | undefined }
    }
  }
  attributs: (lieu: TLieu) => TAttributes
}): StructureListResponse<TAttributes> => {
  const dernier = lieux.at(-1)
  const premier = lieux.at(0)
  const query = requeteDesStructures({
    ids: requete.ids,
    creationDepuis: requete.filter.creation.depuis,
    modificationDepuis: requete.filter.modification.depuis,
  })

  return pageParCurseur({
    data: lieux.map((lieu) => ({
      type: 'structure' as const,
      id: lieu.id,
      attributes: attributs(lieu),
    })),
    total,
    pagination,
    suivant:
      lieux.length === pagination.take && dernier
        ? curseurDeLaStructure(dernier)
        : undefined,
    precedent: curseur && premier ? curseurDeLaStructure(premier) : undefined,
    lien: (cursor) =>
      cursorPageHref(getServerBaseUrl(), '/structures', { cursor, query }),
  })
}
