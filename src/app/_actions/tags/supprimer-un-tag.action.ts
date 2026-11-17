'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification'
import { withMaintenance } from '@/features/maintenance-mode'
import { supprimerUnTag } from '@/features/tags/abilities/supprimer-un-tag'
import { SUPPRIMER_UN_TAG_ERRORS } from '@/features/tags/abilities/supprimer-un-tag/action/supprimer-un-tag.errors'
import { SupprimerUnTagValidation } from '@/features/tags/abilities/supprimer-un-tag/action/supprimer-un-tag.validation'
import { TagId } from '@/features/tags/domain'
import { acteurDe } from '@/features/tags/implementation/session'
import { fromResult, withInput } from '@/libraries/nextjs'

export const supprimerUnTagAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(SupprimerUnTagValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        supprimerUnTag({ tagId: TagId(input.tagId), acteur: acteurDe(user) }),
      { onError: SUPPRIMER_UN_TAG_ERRORS },
    ),
  )
