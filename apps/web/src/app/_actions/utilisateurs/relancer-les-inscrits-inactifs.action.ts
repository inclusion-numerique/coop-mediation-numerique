'use server'

import { lancerLesRelancesDesInscrits } from '@app/web/composition/utilisateurs/relances.ports'
import { actionBuilder } from '@app/web/configuration/nextjs'
import { withAdmin, withAuth } from '@app/web/features/authentification'

export const relancerLesInscritsInactifsAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .execute(async () => ({
    traites: (await lancerLesRelancesDesInscrits(new Date())).length,
  }))
