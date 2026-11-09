'use server'

import { withAuth } from '@app/web/features/authentification'
import { withMaintenance } from '@app/web/features/maintenance-mode'
import { modifierUnTag } from '@app/web/features/tags/abilities/modifier-un-tag'
import { MODIFIER_UN_TAG_ERRORS } from '@app/web/features/tags/abilities/modifier-un-tag/action/modifier-un-tag.errors'
import { ModifierUnTagValidation } from '@app/web/features/tags/abilities/modifier-un-tag/action/modifier-un-tag.validation'
import {
  DescriptionDuTag,
  NomDuTag,
  TagId,
} from '@app/web/features/tags/domain'
import { acteurDe } from '@app/web/features/tags/implementation/session'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'
import { success } from '@app/web/libraries/result'

export const modifierUnTagAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(ModifierUnTagValidation))
  .execute(
    fromResult(
      async ({ user, input }) => {
        const modifie = await modifierUnTag({
          tagId: TagId(input.tagId),
          acteur: acteurDe(user),
          nom: NomDuTag(input.nom),
          description: DescriptionDuTag.safe(input.description ?? ''),
        })

        return modifie.success ? success({ nom: modifie.data.nom }) : modifie
      },
      { onError: MODIFIER_UN_TAG_ERRORS },
    ),
  )
