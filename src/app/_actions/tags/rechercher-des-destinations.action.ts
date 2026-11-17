'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification'
import { destinationsDeFusion } from '@/features/tags/abilities/fusionner-un-tag'
import { RechercherDesDestinationsValidation } from '@/features/tags/abilities/fusionner-un-tag/action/rechercher-des-destinations.validation'
import { destinationsAffichees } from '@/features/tags/abilities/fusionner-un-tag/ui/destinations.presenter'
import { TagId } from '@/features/tags/domain'
import { acteurDe } from '@/features/tags/implementation/session'
import { withInput } from '@/libraries/nextjs'

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
