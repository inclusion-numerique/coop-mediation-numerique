'use server'

import { withAuth } from '@app/web/features/authentification'
import { withMaintenance } from '@app/web/features/maintenance-mode'
import { fusionnerUnTag } from '@app/web/features/tags/abilities/fusionner-un-tag'
import { FUSIONNER_UN_TAG_ERRORS } from '@app/web/features/tags/abilities/fusionner-un-tag/action/fusionner-un-tag.errors'
import { FusionnerUnTagValidation } from '@app/web/features/tags/abilities/fusionner-un-tag/action/fusionner-un-tag.validation'
import { TagId } from '@app/web/features/tags/domain'
import { acteurDe } from '@app/web/features/tags/implementation/session'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'
import { success } from '@app/web/libraries/result'

export const fusionnerUnTagAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(FusionnerUnTagValidation))
  .execute(
    fromResult(
      async ({ user, input }) => {
        const fusion = await fusionnerUnTag({
          acteur: acteurDe(user),
          sourceId: TagId(input.sourceId),
          destinationId: TagId(input.destinationId),
        })

        return fusion.success ? success({ nom: fusion.data.nom }) : fusion
      },
      { onError: FUSIONNER_UN_TAG_ERRORS },
    ),
  )
