'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { SUPPRIMER_UN_TAG_ERRORS } from '@/features/tags/abilities/supprimer-un-tag/action/supprimer-un-tag.errors'
import { SupprimerUnTagValidation } from '@/features/tags/abilities/supprimer-un-tag/action/supprimer-un-tag.validation'
import { supprimerUnTag } from '@/features/tags/abilities/supprimer-un-tag/implementations/prisma/supprimer-un-tag.mutation'
import { acteurDe, TagId } from '@/features/tags/domain'
import { fromResult, withInput } from '@/libraries/nextjs'

export const supprimerUnTagAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(SupprimerUnTagValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        supprimerUnTag({
          tagId: TagId(input.tagId),
          acteur: acteurDe(profilDeLaSession(user)),
        }),
      { onError: SUPPRIMER_UN_TAG_ERRORS },
    ),
  )
