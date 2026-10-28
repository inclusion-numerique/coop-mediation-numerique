'use server'

import { withAuth } from '@app/web/features/authentification'
import { destinationsDeFusion } from '@app/web/features/tags/abilities/fusionner-un-tag'
import { RechercherDesDestinationsValidation } from '@app/web/features/tags/abilities/fusionner-un-tag/action/rechercher-des-destinations.validation'
import { destinationsAffichees } from '@app/web/features/tags/abilities/fusionner-un-tag/ui/destinations.presenter'
import { TagId } from '@app/web/features/tags/domain'
import { acteurDe } from '@app/web/features/tags/implementation/session'
import { actionBuilder, withInput } from '@app/web/libraries/nextjs'

export const rechercherDesDestinationsAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RechercherDesDestinationsValidation))
  .execute(async ({ user, input }) => {
    const acteur = acteurDe(user)
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
