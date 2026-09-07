import { z } from 'zod'

/**
 * La fusion absorbe la source dans la cible : la source disparaît, ses
 * rattachements, activités et listes rejoignent l'autre. L'ordre n'est donc pas
 * commutatif, et les deux identifiants ne se confondent pas.
 */
export const FusionnerDesLieuxValidation = z
  .object({
    sourceStructureId: z.string().uuid(),
    targetStructureId: z.string().uuid(),
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
