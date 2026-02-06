import z from 'zod'

export const MergeTagValidation = z.object({
  sourceTagId: z.string().uuid(),
  destinationTagId: z.string().uuid(),
})
