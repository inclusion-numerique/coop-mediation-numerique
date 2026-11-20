'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin, withAuth } from '@/features/authentification'
import { lancerLesRelancesDInscription } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees'
import { retirerDuRegistre } from '@/libraries/registre-personne'

export const relancerLesInscriptionsInacheveesAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .execute(async () => ({
    traites: (
      await lancerLesRelancesDInscription(new Date(), retirerDuRegistre)
    ).length,
  }))
