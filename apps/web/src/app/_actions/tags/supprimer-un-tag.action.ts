'use server'

import { withAuth } from '@app/web/features/authentification'
import { withMaintenance } from '@app/web/features/maintenance-mode'
import { supprimerUnTag } from '@app/web/features/tags/abilities/supprimer-un-tag'
import { SUPPRIMER_UN_TAG_ERRORS } from '@app/web/features/tags/abilities/supprimer-un-tag/action/supprimer-un-tag.errors'
import { SupprimerUnTagValidation } from '@app/web/features/tags/abilities/supprimer-un-tag/action/supprimer-un-tag.validation'
import { TagId } from '@app/web/features/tags/domain'
import { acteurDe } from '@app/web/features/tags/implementation/session'
import { actionBuilder, fromResult, withInput } from '@app/web/libraries/nextjs'

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
