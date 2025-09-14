import z from 'zod'

export const RemapDuplicatedStructuresV1JobValidation = z.object({
  name: z.literal('remap-duplicated-structures-v1'),
  payload: z.object({}).default({}),
})

export type RemapDuplicatedStructuresV1Job = z.infer<
  typeof RemapDuplicatedStructuresV1JobValidation
>
