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
    // If a cluster in the action plan contains at least one structure (source
    // or target) listed here, the entire cluster is skipped. Use to protect
    // risky fusions (e.g. several active structures with many activities)
    // until they have been validated manually. Structure UUIDs are stable
    // across plan regenerations.
    excludeStructureIds: z.array(z.string().uuid()).optional(),
  }),
})

export type ApplyFusionnerStructuresJob = z.infer<
  typeof ApplyFusionnerStructuresJobValidation
>
