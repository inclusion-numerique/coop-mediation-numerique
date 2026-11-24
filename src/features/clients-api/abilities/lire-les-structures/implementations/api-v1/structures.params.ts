import { z } from 'zod'
import {
  FiltreDeDatesValidation,
  IdsValidation,
} from '@/features/clients-api/implementations/api-v1'
import { JsonApiCursorPaginationQueryParamsValidation } from '@/libraries/json-api/cursor-pagination'
import type { PaginationParCurseur } from '@/libraries/json-api/page-par-curseur'

export const StructuresQueryParamsValidation =
  JsonApiCursorPaginationQueryParamsValidation.extend({
    ids: IdsValidation,
    filter: FiltreDeDatesValidation,
  })

type StructuresQueryParams = z.infer<typeof StructuresQueryParamsValidation>

const StructureCursorValidation = z.object({
  creation_id: z.object({
    creation: z.coerce.string().pipe(z.iso.datetime()),
    id: z.guid(),
  }),
})

const dateDepuis = (depuis: string | undefined): Date | undefined =>
  depuis ? new Date(depuis) : undefined

const curseurDeStructure = (curseur: string[] | undefined) =>
  curseur
    ? StructureCursorValidation.parse({
        creation_id: { creation: curseur[0], id: curseur[1] },
      }).creation_id
    : undefined

export const criteresDesStructures = (
  queryParams: StructuresQueryParams,
  pagination: PaginationParCurseur,
  curseur: string[] | undefined,
) => {
  const creeDepuis = dateDepuis(queryParams.filter.creation.depuis)
  const modifieDepuis = dateDepuis(queryParams.filter.modification.depuis)
  const curseurLu = curseurDeStructure(curseur)
  return {
    ids: queryParams.ids,
    ...(creeDepuis === undefined ? {} : { creeDepuis }),
    ...(modifieDepuis === undefined ? {} : { modifieDepuis }),
    take: pagination.take,
    ...(pagination.skip === undefined ? {} : { skip: pagination.skip }),
    ...(curseurLu === undefined ? {} : { curseur: curseurLu }),
  }
}
