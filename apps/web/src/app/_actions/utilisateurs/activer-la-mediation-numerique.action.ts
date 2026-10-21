'use server'

import { withAuth } from '@app/web/features/authentification'
import { activerLaMediationNumerique } from '@app/web/features/utilisateurs/abilities/activer-la-mediation-numerique'
import { ACTIVER_LA_MEDIATION_NUMERIQUE_ERRORS } from '@app/web/features/utilisateurs/abilities/activer-la-mediation-numerique/action/activer-la-mediation-numerique.errors'
import { actionBuilder, fromResult } from '@app/web/libraries/nextjs'

export const activerLaMediationNumeriqueAction = actionBuilder()
  .use(withAuth())
  .execute(
    fromResult(({ user }) => activerLaMediationNumerique(user.id), {
      onError: ACTIVER_LA_MEDIATION_NUMERIQUE_ERRORS,
    }),
  )
