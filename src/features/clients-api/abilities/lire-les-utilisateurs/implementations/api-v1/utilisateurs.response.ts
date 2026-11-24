import { getServerBaseUrl } from '@/configuration/projet/base-url'
import {
  createCompositeCursor,
  cursorPageHref,
} from '@/libraries/json-api/cursor-pagination'
import type {
  JsonApiListResponse,
  JsonApiResource,
} from '@/libraries/json-api/json-api-types'
import {
  type PaginationParCurseur,
  pageParCurseur,
} from '@/libraries/json-api/page-par-curseur'

type UtilisateurResource<TAttributes extends object> = JsonApiResource<
  'utilisateur',
  TAttributes,
  never
>

export type UtilisateurListResponse<TAttributes extends object> =
  JsonApiListResponse<UtilisateurResource<TAttributes>>

const curseurDeLUtilisateur = ({
  created,
  id,
}: {
  created: Date
  id: string
}): string => createCompositeCursor(created.toISOString(), id)

export const reponseDesUtilisateurs = <
  TUtilisateur extends { readonly id: string; readonly created: Date },
  TAttributes extends object,
>({
  utilisateurs,
  total,
  pagination,
  curseur,
  attributs,
}: {
  utilisateurs: readonly TUtilisateur[]
  total: number
  pagination: PaginationParCurseur
  curseur: string[] | undefined
  attributs: (utilisateur: TUtilisateur) => TAttributes
}): UtilisateurListResponse<TAttributes> => {
  const dernier = utilisateurs.at(-1)
  const premier = utilisateurs.at(0)

  return pageParCurseur({
    data: utilisateurs.map((utilisateur) => ({
      type: 'utilisateur' as const,
      id: utilisateur.id,
      attributes: attributs(utilisateur),
    })),
    total,
    pagination,
    suivant: dernier ? curseurDeLUtilisateur(dernier) : undefined,
    precedent: curseur && premier ? curseurDeLUtilisateur(premier) : undefined,
    lien: (cursor) =>
      cursorPageHref(getServerBaseUrl(), '/utilisateurs', { cursor }),
  })
}
