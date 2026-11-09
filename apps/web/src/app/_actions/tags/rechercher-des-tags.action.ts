'use server'

import { withAuth } from '@app/web/features/authentification'
import { rechercherDesTags } from '@app/web/features/tags/abilities/rechercher-des-tags'
import { RechercherDesTagsValidation } from '@app/web/features/tags/abilities/rechercher-des-tags/action/rechercher-des-tags.validation'
import { TagId } from '@app/web/features/tags/domain'
import { acteurDe } from '@app/web/features/tags/implementation/session'
import { tagAffiche } from '@app/web/features/tags/ui/tag-affiche.presenter'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'

export const rechercherDesTagsAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RechercherDesTagsValidation))
  .execute(async ({ user, input }) => {
    const acteur = acteurDe(user)
    const tags = await rechercherDesTags({
      acteur,
      recherche: input.recherche,
      exclus: input.exclus.map(TagId),
      limite: 10,
    })

    return tags.map(tagAffiche(acteur))
  })
