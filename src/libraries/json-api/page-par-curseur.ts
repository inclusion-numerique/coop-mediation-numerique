import {
  type CursorDirection,
  cursorListMeta,
  parseCompositeCursor,
  type prismaCursorPagination,
} from '@/libraries/json-api/cursor-pagination'
import type {
  JsonApiListResponse,
  JsonApiResource,
} from '@/libraries/json-api/json-api-types'

export type PaginationParCurseur = ReturnType<typeof prismaCursorPagination>

export type CurseurDePage = {
  direction: CursorDirection
  value: string
}

export const curseurDeLaPage = (
  pagination: PaginationParCurseur,
): CurseurDePage | undefined =>
  pagination.cursor
    ? {
        direction: pagination.isBefore ? 'before' : 'after',
        value: pagination.cursor,
      }
    : undefined

export const curseurLu = (
  pagination: PaginationParCurseur,
): string[] | undefined =>
  pagination.cursor ? parseCompositeCursor(pagination.cursor) : undefined

export const pageParCurseur = <
  TResource extends JsonApiResource<string, object>,
>({
  data,
  total,
  pagination,
  suivant,
  precedent,
  lien,
}: {
  data: TResource[]
  total: number
  pagination: PaginationParCurseur
  suivant: string | undefined
  precedent: string | undefined
  lien: (curseur?: CurseurDePage) => string
}): JsonApiListResponse<TResource> => ({
  data,
  links: {
    self: { href: lien(curseurDeLaPage(pagination)) },
    ...(suivant
      ? { next: { href: lien({ direction: 'after', value: suivant }) } }
      : {}),
    ...(precedent
      ? { prev: { href: lien({ direction: 'before', value: precedent }) } }
      : {}),
  },
  meta: cursorListMeta({
    totalCount: total,
    take: pagination.take,
    nextCursor: suivant,
    previousCursor: precedent,
  }),
})
