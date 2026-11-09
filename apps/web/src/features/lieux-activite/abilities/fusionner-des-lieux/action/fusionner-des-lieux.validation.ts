import { z } from 'zod'

export const FusionnerDesLieuxValidation = z
  .object({
    sourceStructureId: z.guid(),
    targetStructureId: z.guid(),
  })
  .refine(
    ({ sourceStructureId, targetStructureId }) =>
      sourceStructureId !== targetStructureId,
    {
      message: 'Un lieu ne se fusionne pas avec lui-même',
      path: ['targetStructureId'],
    },
  )

export type FusionnerDesLieuxData = z.infer<typeof FusionnerDesLieuxValidation>
