'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { profilDeLaSession, withAuth } from '@/features/authentification'
import { rechercherDesTags } from '@/features/tags/abilities/rechercher-des-tags'
import { RechercherDesTagsValidation } from '@/features/tags/abilities/rechercher-des-tags/action/rechercher-des-tags.validation'
import { acteurDe, TagId } from '@/features/tags/domain'
import { tagAffiche } from '@/features/tags/ui/tag-affiche.presenter'
import { withInput } from '@/libraries/nextjs'

export const rechercherDesTagsAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RechercherDesTagsValidation))
  .execute(async ({ user, input }) => {
    const acteur = acteurDe(profilDeLaSession(user))
    const tags = await rechercherDesTags({
      acteur,
      recherche: input.recherche,
      exclus: input.exclus.map(TagId),
      limite: 10,
    })

    return tags.map(tagAffiche(acteur))
  })
