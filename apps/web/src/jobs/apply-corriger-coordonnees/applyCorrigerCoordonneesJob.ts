import z from 'zod'

export const ApplyCorrigerCoordonneesJobValidation = z.object({
  name: z.literal('apply-corriger-coordonnees'),
  payload: z
    .object({
      dryRun: z.boolean().optional().default(true),
      // Skip these structures (e.g. a BAN match that lands in the wrong
      // region despite a decent score). Structure UUIDs are stable.
      excludeStructureIds: z.array(z.string().uuid()).optional(),
      // Minimum BAN geocoding score to accept a correction. Below this the
      // match is considered too unreliable and the structure is left as-is.
      minBanScore: z.number().optional().default(0.65),
    })
    .optional(),
})

export type ApplyCorrigerCoordonneesJob = z.infer<
  typeof ApplyCorrigerCoordonneesJobValidation
>
