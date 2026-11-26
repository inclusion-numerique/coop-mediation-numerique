'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { SUPPRIMER_UN_TAG_ERRORS } from '@/features/tags/abilities/supprimer-un-tag/action/supprimer-un-tag.errors'
import { SupprimerUnTagValidation } from '@/features/tags/abilities/supprimer-un-tag/action/supprimer-un-tag.validation'
import { supprimerUnTag } from '@/features/tags/abilities/supprimer-un-tag/domain/supprimer-un-tag'
import { effacerUnTag } from '@/features/tags/abilities/supprimer-un-tag/implementations/prisma/effacer-un-tag.mutation'
import { acteurDe, TagId } from '@/features/tags/domain'
import { lireUnTagActif } from '@/features/tags/implementations/prisma/tag-actif.query'
import { fromResult, withInput } from '@/libraries/nextjs'
import { success } from '@/libraries/result'

export const supprimerUnTagAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(SupprimerUnTagValidation))
  .execute(
    fromResult(
      async ({ user, input }) => {
        const suppression = await supprimerUnTag({
          lireUnTagActif,
          effacer: effacerUnTag,
        })({
          tagId: TagId(input.tagId),
          acteur: acteurDe(profilDeLaSession(user)),
        })

        return suppression.success
          ? success({ nom: suppression.data.nom })
          : suppression
      },
      { onError: SUPPRIMER_UN_TAG_ERRORS },
    ),
  )
