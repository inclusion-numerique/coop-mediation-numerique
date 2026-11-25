import { z } from 'zod'
import { Jour } from '../../../domain'

export const ParametresDeLExport = z.object({
  date: Jour.schema.optional(),
})
