'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { profilDeLaSession } from '@/features/authentification/domain/profil-de-la-session'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RechercherDesDestinationsValidation } from '@/features/tags/abilities/rechercher-des-destinations/action/rechercher-des-destinations.validation'
import { rechercherDesDestinations } from '@/features/tags/abilities/rechercher-des-destinations/domain/rechercher-des-destinations'
import { lireLesCandidatesALaFusion } from '@/features/tags/abilities/rechercher-des-destinations/implementations/prisma/destinations-de-fusion.query'
import { destinationsAffichees } from '@/features/tags/abilities/rechercher-des-destinations/ui/presenters/destinations.presenter'
import { TagId } from '@/features/tags/domain'
import { lireUnTagActif } from '@/features/tags/implementations/prisma/tag-actif.query'
import { acteurDe } from '@/features/tags/implementations/session/acteur.transfer'
import { withInput } from '@/libraries/nextjs'

export const rechercherDesDestinationsAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RechercherDesDestinationsValidation))
  .execute(async ({ user, input }) => {
    const acteur = acteurDe(profilDeLaSession(user))
    const recherche = input.recherche.trim()

    const destinations = await rechercherDesDestinations({
      lireUnTagActif,
      lireLesCandidates: lireLesCandidatesALaFusion,
    })({
      acteur,
      sourceId: TagId(input.sourceId),
      recherche,
      limite: recherche === '' ? 5 : 10,
    })

    return destinationsAffichees(acteur, destinations.data)
  })
