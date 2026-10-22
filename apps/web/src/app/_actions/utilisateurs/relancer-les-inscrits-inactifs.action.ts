'use server'

import { lancerLesRelancesDesInscrits } from '@app/web/composition/utilisateurs/relances.ports'
import { withAdmin, withAuth } from '@app/web/features/authentification'
import { actionBuilder } from '@app/web/libraries/nextjs'

export const relancerLesInscritsInactifsAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .execute(async () => ({
    traites: (await lancerLesRelancesDesInscrits(new Date())).length,
  }))
