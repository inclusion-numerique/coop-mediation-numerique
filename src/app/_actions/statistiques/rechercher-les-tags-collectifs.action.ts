'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAdmin } from '@/features/authentification/middlewares/with-admin'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { tagsRecherches } from '@/features/tags/abilities/lire-les-tags-visibles/domain'
import { lireLesTagsCollectifs } from '@/features/tags/abilities/lire-les-tags-visibles/implementations/prisma/lire-les-tags-visibles.query'
import { tagCollectifAffiche } from '@/features/tags/abilities/lire-les-tags-visibles/ui/presenters/tag-collectif.presenter'
import { RechercherDesTagsValidation } from '@/features/tags/abilities/rechercher-des-tags/action/rechercher-des-tags.validation'
import { withInput } from '@/libraries/nextjs'

export const rechercherLesTagsCollectifsAction = actionBuilder()
  .use(withAuth())
  .use(withAdmin())
  .use(withInput(RechercherDesTagsValidation))
  .execute(async ({ input: { recherche } }) =>
    tagsRecherches(await lireLesTagsCollectifs(), recherche).map(
      tagCollectifAffiche,
    ),
  )
