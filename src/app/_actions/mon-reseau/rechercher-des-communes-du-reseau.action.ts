'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { communesDesLieux } from '@/features/lieux-activite/abilities/lister-les-lieux-du-departement/implementations/prisma/communes-des-lieux.query'
import { RechercherDesCommunesDuReseauValidation } from '@/features/mon-reseau/action/rechercher-des-communes-du-reseau.validation'
import { optionsRecherchees } from '@/libraries/etat-d-url'
import { withInput } from '@/libraries/nextjs'

const rechercherDansLeDepartement = actionBuilder()
  .use(withAuth())
  .use(withInput(RechercherDesCommunesDuReseauValidation))
  .execute(async ({ input: { departement, recherche } }) =>
    optionsRecherchees(
      (await communesDesLieux({ departementCode: departement }))
        .communesOptions,
      recherche,
    ),
  )

export const rechercherDesCommunesDuReseauAction = async (
  departement: string,
  input: { recherche: string },
) => rechercherDansLeDepartement({ ...input, departement })
