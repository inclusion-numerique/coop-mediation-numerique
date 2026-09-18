import z from 'zod'

export const MergeTagValidation = z.object({
  sourceTagId: z.guid(),
  destinationTagId: z.guid(),
})
