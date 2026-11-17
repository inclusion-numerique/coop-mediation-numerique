'use server'

import { lancerLesRelancesDInscription } from '@app/web/composition/utilisateurs/relances.ports'
import { actionBuilder } from '@app/web/configuration/nextjs'
import { withAdmin, withAuth } from '@app/web/features/authentification'

export const relancerLesInscriptionsInacheveesAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .execute(async () => ({
    traites: (await lancerLesRelancesDInscription(new Date())).length,
  }))
