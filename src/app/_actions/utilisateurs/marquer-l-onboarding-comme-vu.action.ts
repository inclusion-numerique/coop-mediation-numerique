'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification'
import { withMaintenance } from '@/features/maintenance-mode'
import { marquerLOnboardingCommeVu } from '@/features/utilisateurs/abilities/marquer-l-onboarding-comme-vu'

export const marquerLOnboardingCommeVuAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .execute(({ user }) =>
    marquerLOnboardingCommeVu({
      utilisateurId: user.id,
      maintenant: new Date(),
    }),
  )
