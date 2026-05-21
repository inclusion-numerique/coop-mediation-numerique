import z from 'zod'

export const GenerateStructuresActionPlanJobValidation = z.object({
  name: z.literal('generate-structures-action-plan'),
  payload: z
    .object({
      seuilScoreDoublon: z.number().optional().default(0.6),
    })
    .optional(),
})

export type GenerateStructuresActionPlanJob = z.infer<
  typeof GenerateStructuresActionPlanJobValidation
>
