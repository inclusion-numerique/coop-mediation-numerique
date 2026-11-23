'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { ACTIVER_LA_MEDIATION_NUMERIQUE_ERRORS } from '@/features/utilisateurs/abilities/activer-la-mediation-numerique/action/activer-la-mediation-numerique.errors'
import { activerLaMediationNumeriqueAvec } from '@/features/utilisateurs/abilities/activer-la-mediation-numerique/implementations/activer-la-mediation-numerique.binding'
import { fromResult } from '@/libraries/nextjs'

export const activerLaMediationNumeriqueAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .execute(
    fromResult(
      ({ user }) =>
        activerLaMediationNumeriqueAvec(synchroniserPersonne)(user.id),
      {
        onError: ACTIVER_LA_MEDIATION_NUMERIQUE_ERRORS,
      },
    ),
  )
