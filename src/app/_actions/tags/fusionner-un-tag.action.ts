'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { FUSIONNER_UN_TAG_ERRORS } from '@/features/tags/abilities/fusionner-un-tag/action/fusionner-un-tag.errors'
import { FusionnerUnTagValidation } from '@/features/tags/abilities/fusionner-un-tag/action/fusionner-un-tag.validation'
import { fusionnerUnTag } from '@/features/tags/abilities/fusionner-un-tag/implementations/prisma/fusionner-un-tag.mutation'
import { acteurDe, TagId } from '@/features/tags/domain'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

export const fusionnerUnTagAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(FusionnerUnTagValidation))
  .execute(
    fromResult(
      async ({ user, input }) => {
        const fusion = await fusionnerUnTag({
          acteur: acteurDe(profilDeLaSession(user)),
          sourceId: TagId(input.sourceId),
          destinationId: TagId(input.destinationId),
        })

        return fusion.success ? success({ nom: fusion.data.nom }) : fusion
      },
      { onError: FUSIONNER_UN_TAG_ERRORS },
    ),
  )
