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

/**
 * Les suggestions du champ d'ajout : la coop, la cartographie nationale et,
 * en dernier recours, l'annuaire des entreprises.
 *
 * Elle sert les deux parcours qui ajoutent un lieu : le panier des lieux
 * d'activité et l'étape d'inscription. C'est une action et non une procédure
 * tRPC pour qu'elle ne franchisse pas la frontière du navigateur — elle tire le
 * client Prisma.
 */
export const rechercherDesLieuxAAjouterAction = actionBuilder()
  .use(withAuth())
  .use(withInput(RechercherDesLieuxAAjouterValidation))
  .execute(async ({ input }) => {
    const recherche = await rechercherDesLieuxAAjouter({
      recherche: RechercheDeLieu(input.recherche),
      limite: LIMITE_DES_SUGGESTIONS,
      sauf: [],
    })
    return recherche.success ? recherche.data : recherche.error
  })
