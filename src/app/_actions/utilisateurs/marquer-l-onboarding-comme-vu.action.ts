'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { marquerLOnboardingCommeVu } from '@/features/utilisateurs/abilities/marquer-l-onboarding-comme-vu/implementations/prisma/marquer-l-onboarding-comme-vu.mutation'

export const marquerLOnboardingCommeVuAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .execute(({ user }) =>
    marquerLOnboardingCommeVu({
      utilisateurId: user.id,
      maintenant: new Date(),
    }),
  )
