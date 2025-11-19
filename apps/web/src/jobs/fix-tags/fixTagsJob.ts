import z from 'zod'

export const FixTagsJobValidation = z.object({
  name: z.literal('fix-tags'),
  payload: z.object({}).optional(),
})

export type FixTagsJob = z.infer<typeof FixTagsJobValidation>
