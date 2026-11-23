'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { retirerDuRegistre } from '@/features/registre-des-personnes/implementations/prisma/registre-personne'
import { lancerLesRelancesDInscription } from '@/features/utilisateurs/abilities/relancer-les-inscriptions-inachevees'

export const relancerLesInscriptionsInacheveesAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .execute(async () => ({
    traites: (
      await lancerLesRelancesDInscription(new Date(), retirerDuRegistre)
    ).length,
  }))
