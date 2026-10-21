'use server'

import { lancerLesRelancesDInscription } from '@app/web/composition/utilisateurs/relances.ports'
import { withAdmin, withAuth } from '@app/web/features/authentification'
import { actionBuilder } from '@app/web/libraries/nextjs'

export const relancerLesInscriptionsInacheveesAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .execute(async () => ({
    traites: (await lancerLesRelancesDInscription(new Date())).length,
  }))
