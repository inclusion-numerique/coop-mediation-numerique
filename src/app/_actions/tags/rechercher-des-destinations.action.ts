'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RechercherDesDestinationsValidation } from '@/features/tags/abilities/fusionner-un-tag/action/rechercher-des-destinations.validation'
import { destinationsDeFusion } from '@/features/tags/abilities/fusionner-un-tag/implementations/prisma/destinations-de-fusion.query'
import { destinationsAffichees } from '@/features/tags/abilities/fusionner-un-tag/ui/presenters/destinations.presenter'
import { acteurDe, TagId } from '@/features/tags/domain'
import { withInput } from '@/libraries/nextjs'

export const rechercherDesDestinationsAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RechercherDesDestinationsValidation))
  .execute(async ({ user, input }) => {
    const acteur = acteurDe(profilDeLaSession(user))
    const recherche = input.recherche.trim()

    return destinationsAffichees(
      acteur,
      await destinationsDeFusion({
        acteur,
        sourceId: TagId(input.sourceId),
        recherche,
        limite: recherche === '' ? 5 : 10,
      }),
    )
  })
