'use server'

import { lancerLesRelancesDesInscrits } from '@/composition/utilisateurs/relances.ports'
import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin, withAuth } from '@/features/authentification'

export const relancerLesInscritsInactifsAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .execute(async () => ({
    traites: (await lancerLesRelancesDesInscrits(new Date())).length,
  }))
