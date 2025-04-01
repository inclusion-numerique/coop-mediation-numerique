import z from 'zod'

export const FixStructuresJobValidation = z.object({
  name: z.literal('fix-structures'),
  payload: z.object({}).optional(),
})

export type FixStructuresJob = z.infer<typeof FixStructuresJobValidation>
