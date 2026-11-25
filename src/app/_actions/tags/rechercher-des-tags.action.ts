'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RechercherDesTagsValidation } from '@/features/tags/abilities/rechercher-des-tags/action/rechercher-des-tags.validation'
import { rechercherDesTags } from '@/features/tags/abilities/rechercher-des-tags/implementations/prisma/rechercher-des-tags.query'
import { acteurDe, TagId } from '@/features/tags/domain'
import { tagAffiche } from '@/features/tags/ui/presenters/tag-affiche.presenter'
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
