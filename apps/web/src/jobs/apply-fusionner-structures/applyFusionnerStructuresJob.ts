import z from 'zod'

export const ApplyFusionnerStructuresJobValidation = z.object({
  name: z.literal('apply-fusionner-structures'),
  payload: z.object({
    action: z.enum([
      'fusionner_auto',
      'fusionner_probable',
      'fusionner_a_verifier',
      'fusionner_review',
    ]),
    dryRun: z.boolean().optional().default(true),
  }),
})

export type ApplyFusionnerStructuresJob = z.infer<
  typeof ApplyFusionnerStructuresJobValidation
>
