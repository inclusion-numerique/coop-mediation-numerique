'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { synchroniserPersonne } from '@/features/registre-des-personnes/implementations/prisma/registre-personne.mutation'
import { ACTIVER_LA_MEDIATION_NUMERIQUE_ERRORS } from '@/features/utilisateurs/abilities/activer-la-mediation-numerique/action/activer-la-mediation-numerique.errors'
import { activerLaMediationNumerique } from '@/features/utilisateurs/abilities/activer-la-mediation-numerique/domain/activer-la-mediation-numerique'
import { inscrireALaListeDeDiffusion } from '@/features/utilisateurs/abilities/activer-la-mediation-numerique/implementations/brevo/inscrire-a-la-liste-de-diffusion.mutation'
import {
  activer,
  compteQuiActive,
} from '@/features/utilisateurs/abilities/activer-la-mediation-numerique/implementations/prisma/activer.mutation'
import type { SynchroniserLaPersonne } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import { fromResult } from '@/libraries/nextjs'

const activerLaMediationNumeriqueAvec = (
  synchroniserLaPersonne: SynchroniserLaPersonne,
) =>
  activerLaMediationNumerique({
    lireLeCompteQuiActive: compteQuiActive,
    activer: activer(synchroniserLaPersonne),
    inscrireALaListeDeDiffusion,
  })

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
