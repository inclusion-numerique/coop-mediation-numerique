'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { RechercherDesLieuxAAjouterValidation } from '@/features/lieux-activite/abilities/rechercher-des-lieux-a-ajouter/action/rechercher-des-lieux-a-ajouter.validation'
import { RechercheDeLieu } from '@/features/lieux-activite/abilities/rechercher-des-lieux-a-ajouter/domain/recherche-de-lieu'
import {
  LIMITE_DES_SUGGESTIONS,
  rechercherDesLieuxAAjouter as rechercher,
} from '@/features/lieux-activite/abilities/rechercher-des-lieux-a-ajouter/domain/rechercher-des-lieux-a-ajouter'
import { chercherDansLAnnuaireDesEntreprises } from '@/features/lieux-activite/abilities/rechercher-des-lieux-a-ajouter/implementations/api-entreprise/annuaire-des-entreprises.query'
import { chercherDansLaCartographie } from '@/features/lieux-activite/abilities/rechercher-des-lieux-a-ajouter/implementations/entrepot/lieux-de-la-cartographie.query'
import { chercherDansLaCoop } from '@/features/lieux-activite/abilities/rechercher-des-lieux-a-ajouter/implementations/prisma/lieux-de-la-coop.query'
import { withInput } from '@/libraries/nextjs'

const rechercherDesLieuxAAjouter = rechercher({
  chercherDansLaCoop,
  chercherDansLaCartographie,
  chercherDansLAnnuaireDesEntreprises,
})

export const rechercherDesLieuxAAjouterAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RechercherDesLieuxAAjouterValidation))
  .execute(async ({ input }) => {
    const recherche = await rechercherDesLieuxAAjouter({
      recherche: RechercheDeLieu(input.recherche),
      limite: LIMITE_DES_SUGGESTIONS,
    })
    return recherche.data
  })
