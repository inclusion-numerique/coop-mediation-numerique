'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification'
import { withMaintenance } from '@/features/maintenance-mode'
import { fusionnerUnTag } from '@/features/tags/abilities/fusionner-un-tag'
import { FUSIONNER_UN_TAG_ERRORS } from '@/features/tags/abilities/fusionner-un-tag/action/fusionner-un-tag.errors'
import { FusionnerUnTagValidation } from '@/features/tags/abilities/fusionner-un-tag/action/fusionner-un-tag.validation'
import { TagId } from '@/features/tags/domain'
import { acteurDe } from '@/features/tags/implementation/session'
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
          acteur: acteurDe(user),
          sourceId: TagId(input.sourceId),
          destinationId: TagId(input.destinationId),
        })

        return fusion.success ? success({ nom: fusion.data.nom }) : fusion
      },
      { onError: FUSIONNER_UN_TAG_ERRORS },
    ),
  )
