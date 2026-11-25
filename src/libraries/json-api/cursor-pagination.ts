/**
 * We use cursor pagination for the v1 list endpoints
 * See why: https://jsonapi.org/profiles/ethanresnick/cursor-pagination/
 */
import { ZodError, z } from 'zod'
import {
  decodeSerializableState,
  EncodedState,
  encodeSerializableState,
} from '@/libraries/etat-encode'
import { apiV1Url } from '@/libraries/json-api/api-v1-url'
import type { JsonApiListMeta } from '@/libraries/json-api/json-api-types'

export const defaultJsonApiCursorPaginationSize = 500
const maxJsonApiCursorPaginationSize = 500
export const JsonApiCursorPaginationQueryParamsValidation = z.object({
  page: z
    .object({
      size: z.coerce
        .number()
        .min(1)
        .max(maxJsonApiCursorPaginationSize)
        .default(defaultJsonApiCursorPaginationSize),
      after: z.string().optional(),
      before: z.string().optional(),
    })
    .prefault({}),
})

export type JsonApiCursorPaginationQueryParams = z.infer<
  typeof JsonApiCursorPaginationQueryParamsValidation
>

export const prismaCursorPagination = (
  cursorQueryParams: JsonApiCursorPaginationQueryParams,
) => {
  const take = cursorQueryParams.page.size

  const encodedCursor = (cursorQueryParams.page.after ||
    cursorQueryParams.page.before) as EncodedState<string> | undefined

  if (!encodedCursor) return { take, skip: undefined, cursor: undefined }

  const cursor = decodeSerializableState(encodedCursor, '')

  const isBefore = !!cursorQueryParams.page.before

  if (!cursor) {
    throw new ZodError([
      {
        message: 'Invalid cursor',
        path: isBefore ? ['page', 'before'] : ['page', 'after'],
        code: 'custom',
      },
    ])
  }

  return {
    isBefore,
    take: isBefore ? -take : take,
    skip: 1,
    cursor,
  }
}

export const createCompositeCursor = (...cursorParts: string[]) =>
  cursorParts.join('###')

export const parseCompositeCursor = (compositeCursor: string) =>
  compositeCursor.split('###')

export type CursorDirection = 'after' | 'before'

export const cursorPageHref = (
  urlDeBase: string,
  path: string,
  {
    cursor,
    query = '',
  }: {
    cursor?: { direction: CursorDirection; value: string } | undefined
    query?: string | undefined
  } = {},
) => {
  const parts = [
    ...(cursor
      ? [`page[${cursor.direction}]=${encodeSerializableState(cursor.value)}`]
      : []),
    ...(query ? [query] : []),
  ]

  return apiV1Url(
    urlDeBase,
    parts.length > 0 ? `${path}?${parts.join('&')}` : path,
  )
}

export const cursorListMeta = ({
  totalCount,
  take,
  nextCursor,
  previousCursor,
}: {
  totalCount: number
  take: number
  nextCursor: string | undefined
  previousCursor: string | undefined
}): JsonApiListMeta => ({
  total_count: totalCount,
  items_per_page: take,
  total_pages: Math.ceil(totalCount / take),
  has_next_page: !!nextCursor,
  has_prev_page: !!previousCursor,
})
