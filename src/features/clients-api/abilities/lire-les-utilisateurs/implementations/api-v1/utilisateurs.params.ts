import { z } from 'zod'
import { JsonApiCursorPaginationQueryParamsValidation } from '@/libraries/json-api'

export const UtilisateursQueryParamsValidation =
  JsonApiCursorPaginationQueryParamsValidation.extend({
    filter: z
      .object({
        conseiller_numerique: z
          .union([z.literal('0'), z.literal('1')])
          .optional(),
        conseiller_numerique_id_pg: z
          .union([z.string(), z.array(z.string())])
          .optional()
          .transform((value) => (typeof value === 'string' ? [value] : value)),
        dataspace_id: z
          .union([z.string(), z.array(z.string())])
          .optional()
          .transform((value) => (typeof value === 'string' ? [value] : value)),
        soft_deleted: z.union([z.literal('0'), z.literal('1')]).optional(),
      })
      .prefault({}),
  })

const CurseurValidation = z.object({
  created: z.coerce.string().pipe(z.iso.datetime()),
  id: z.guid(),
})

export const curseurDUtilisateur = (curseur: string[] | undefined) =>
  curseur
    ? CurseurValidation.parse({ created: curseur[0], id: curseur[1] })
    : null
