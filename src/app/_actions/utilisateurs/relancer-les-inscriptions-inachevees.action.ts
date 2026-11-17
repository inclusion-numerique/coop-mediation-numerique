'use server'

import { lancerLesRelancesDInscription } from '@/composition/utilisateurs/relances.ports'
import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin, withAuth } from '@/features/authentification'

export const relancerLesInscriptionsInacheveesAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .execute(async () => ({
    traites: (await lancerLesRelancesDInscription(new Date())).length,
  }))
