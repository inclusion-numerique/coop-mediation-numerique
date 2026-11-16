'use server'

import { actionBuilder } from '@app/web/configuration/nextjs'
import { withAuth } from '@app/web/features/authentification'
import { withMaintenance } from '@app/web/features/maintenance-mode'
import { marquerLOnboardingCommeVu } from '@app/web/features/utilisateurs/abilities/marquer-l-onboarding-comme-vu'

export const marquerLOnboardingCommeVuAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .execute(({ user }) =>
    marquerLOnboardingCommeVu({
      utilisateurId: user.id,
      maintenant: new Date(),
    }),
  )
