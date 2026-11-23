import { z } from 'zod'

export const IdsValidation = z
  .union([z.string(), z.array(z.string())])
  .optional()
  .transform((v) => (Array.isArray(v) ? v : v ? v.split(',') : []))
  .transform((arr) => arr.map((s) => s.trim()).filter(Boolean))
  .transform((arr) => Array.from(new Set(arr)))
  .pipe(z.array(z.guid()).max(100))
  .default([])

export const FiltreDeDatesValidation = z
  .object({
    creation: z.object({ depuis: z.iso.datetime().optional() }).prefault({}),
    modification: z
      .object({ depuis: z.iso.datetime().optional() })
      .prefault({}),
  })
  .prefault({})

export type FiltreDeDates = z.infer<typeof FiltreDeDatesValidation>
