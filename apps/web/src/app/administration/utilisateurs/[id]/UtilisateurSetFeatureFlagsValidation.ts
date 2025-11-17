import { UserFeatureFlag } from '@prisma/client'
import { z } from 'zod'

export const UtilisateurSetFeatureFlagsValidation = z.object({
  userId: z.string().uuid(),
  featureFlags: z
    .array(
      z.enum(['Assistant'] satisfies [UserFeatureFlag, ...UserFeatureFlag[]], {
        invalid_type_error: 'Veuillez renseigner un feature flag valide',
      }),
    )
    .default([]),
})

export type UtilisateurSetFeatureFlagsData = z.infer<
  typeof UtilisateurSetFeatureFlagsValidation
>
