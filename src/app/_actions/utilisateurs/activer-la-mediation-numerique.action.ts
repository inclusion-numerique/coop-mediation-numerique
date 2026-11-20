'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification'
import { withMaintenance } from '@/features/maintenance-mode'
import { activerLaMediationNumerique } from '@/features/utilisateurs/abilities/activer-la-mediation-numerique'
import { ACTIVER_LA_MEDIATION_NUMERIQUE_ERRORS } from '@/features/utilisateurs/abilities/activer-la-mediation-numerique/action/activer-la-mediation-numerique.errors'
import { fromResult } from '@/libraries/nextjs'
import { synchroniserPersonne } from '@/libraries/registre-personne'

export const activerLaMediationNumeriqueAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .execute(
    fromResult(
      ({ user }) => activerLaMediationNumerique(user.id, synchroniserPersonne),
      {
        onError: ACTIVER_LA_MEDIATION_NUMERIQUE_ERRORS,
      },
    ),
  )
