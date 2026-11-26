'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { FUSIONNER_DES_LIEUX_ERRORS } from '@/features/lieux-activite/abilities/fusionner-des-lieux/action/fusionner-des-lieux.errors'
import { FusionnerDesLieuxValidation } from '@/features/lieux-activite/abilities/fusionner-des-lieux/action/fusionner-des-lieux.validation'
import { fusionnerDesLieux } from '@/features/lieux-activite/abilities/fusionner-des-lieux/domain'
import { fichesAFusionner } from '@/features/lieux-activite/abilities/fusionner-des-lieux/implementations/prisma/fiches-a-fusionner.query'
import { fusionnerLesLieux } from '@/features/lieux-activite/abilities/fusionner-des-lieux/implementations/prisma/fusionner-des-lieux.mutation'
import { LieuId } from '@/features/lieux-activite/domain/identifiants/lieu-id'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

export const fusionnerDesLieuxAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(FusionnerDesLieuxValidation))
  .execute(
    fromResult(
      async ({ input }) => {
        const fusion = await fusionnerDesLieux({
          fichesAFusionner,
          fusionner: fusionnerLesLieux,
        })({
          source: LieuId(input.sourceStructureId),
          cible: LieuId(input.targetStructureId),
          maintenant: new Date(),
        })

        return fusion.success ? success(undefined) : fusion
      },
      { onError: FUSIONNER_DES_LIEUX_ERRORS },
    ),
  )
