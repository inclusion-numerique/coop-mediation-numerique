'use server'

import { withAuth } from '@app/web/features/authentification'
import { marquerLOnboardingCommeVu } from '@app/web/features/utilisateurs/abilities/marquer-l-onboarding-comme-vu'
import { actionBuilder } from '@app/web/libraries/nextjs'

export const marquerLOnboardingCommeVuAction = actionBuilder()
  .use(withAuth())
  .execute(({ user }) =>
    marquerLOnboardingCommeVu({
      utilisateurId: user.id,
      maintenant: new Date(),
    }),
  )
