'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { TAGS_PROPOSES_PAR_LE_CRA } from '@/features/activites/domain'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RechercherDesTagsValidation } from '@/features/tags/abilities/rechercher-des-tags/action/rechercher-des-tags.validation'
import { rechercherDesTags } from '@/features/tags/abilities/rechercher-des-tags/implementations/prisma/rechercher-des-tags.query'
import { TagId } from '@/features/tags/domain'
import { acteurDe } from '@/features/tags/implementations/session/acteur.transfer'
import { tagAffiche } from '@/features/tags/ui/presenters/tag-affiche.presenter'
import { withInput } from '@/libraries/nextjs'

const rechercherAuPlus = (limite: number) =>
  actionBuilder()
    .use(withAuth())
    .use(withInput(RechercherDesTagsValidation))
    .execute(async ({ user, input }) => {
      const acteur = acteurDe(profilDeLaSession(user))
      const tags = await rechercherDesTags({
        acteur,
        recherche: input.recherche,
        exclus: input.exclus.map(TagId),
        limite,
      })

      return tags.map(tagAffiche(acteur))
    })

export const rechercherDesTagsAction = rechercherAuPlus(10)

export const rechercherDesTagsDuCraAction = rechercherAuPlus(
  TAGS_PROPOSES_PAR_LE_CRA,
)
