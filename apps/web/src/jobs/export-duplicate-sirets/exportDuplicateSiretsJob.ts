import z from 'zod'

export const ExportDuplicateSiretsJobValidation = z.object({
  name: z.literal('export-duplicate-sirets'),
  payload: z.object({}).optional(),
})

export type ExportDuplicateSiretsJob = z.infer<
  typeof ExportDuplicateSiretsJobValidation
>
