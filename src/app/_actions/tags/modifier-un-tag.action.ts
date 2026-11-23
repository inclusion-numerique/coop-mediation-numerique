'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { MODIFIER_UN_TAG_ERRORS } from '@/features/tags/abilities/modifier-un-tag/action/modifier-un-tag.errors'
import { ModifierUnTagValidation } from '@/features/tags/abilities/modifier-un-tag/action/modifier-un-tag.validation'
import { modifierUnTag } from '@/features/tags/abilities/modifier-un-tag/implementations/prisma/modifier-un-tag.mutation'
import {
  acteurDe,
  DescriptionDuTag,
  NomDuTag,
  TagId,
} from '@/features/tags/domain'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

export const modifierUnTagAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(ModifierUnTagValidation))
  .execute(
    fromResult(
      async ({ user, input }) => {
        const modifie = await modifierUnTag({
          tagId: TagId(input.tagId),
          acteur: acteurDe(profilDeLaSession(user)),
          nom: NomDuTag(input.nom),
          description: DescriptionDuTag.safe(input.description ?? ''),
        })

        return modifie.success ? success({ nom: modifie.data.nom }) : modifie
      },
      { onError: MODIFIER_UN_TAG_ERRORS },
    ),
  )
