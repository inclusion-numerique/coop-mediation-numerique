'use server'

import { actionBuilder } from '@/configuration/nextjs'
import { withAuth } from '@/features/authentification/middlewares/with-auth'
import { withMaintenance } from '@/features/maintenance-mode/middlewares/with-maintenance'
import { METTRE_A_JOUR_STATUT_RDV_ERRORS } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/action/mettre-a-jour-statut-rdv.errors'
import { MettreAJourStatutRdvValidation } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/action/mettre-a-jour-statut-rdv.validation'
import { mettreAJourStatutRdv } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/domain/mettre-a-jour-statut-rdv'
import { contexteMiseAJourStatut } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementations/prisma/contexte-mise-a-jour-statut.query'
import { enregistrerStatutRdv } from '@/features/rdvsp/abilities/mettre-a-jour-statut-rdv/implementations/prisma/enregistrer-statut-rdv.mutation'
import { UtilisateurCoopId } from '@/features/rdvsp/domain/identifiants/utilisateur-coop-id'
import { rdvServicePublicApi } from '@/features/rdvsp/implementations/api/rdv-service-public.client'
import { configurationRdvServicePublic } from '@/features/rdvsp/implementations/api/rdv-service-public-configuration.client'
import { enregistrerLesJetons } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.mutation'
import { jetonsCourants } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.query'
import { fromResult, withInput } from '@/libraries/nextjs'

/**
 * Composition de l'ability avec ses adaptateurs réels, partagée par la server
 * action et par le routeur des comptes rendus d'activité : deux appelants, deux
 * couches, et rien qui signalerait que les copies doivent rester identiques.
 *
 * À importer par ce chemin explicite : le module tire Prisma et la configuration
 * de l'API, qu'un composant client ne doit jamais embarquer.
 */
const mettreAJourLeStatutDuRdv = mettreAJourStatutRdv({
  contexte: contexteMiseAJourStatut,
  changerStatutRdv: rdvServicePublicApi({
    ...configurationRdvServicePublic(),
    onJetonsRenouveles: enregistrerLesJetons,
    jetonsCourants,
  }).changerStatutRdv,
  enregistrer: enregistrerStatutRdv,
})

export const mettreAJourStatutRdvAction = actionBuilder()
  .use(withAuth())
  .use(withMaintenance())
  .use(withInput(MettreAJourStatutRdvValidation))
  .execute(
    fromResult(
      async ({ user, input }) =>
        mettreAJourLeStatutDuRdv({
          utilisateurId: UtilisateurCoopId(user.id),
          rdvId: input.rdvId,
          statut: input.statut,
        }),
      { onError: METTRE_A_JOUR_STATUT_RDV_ERRORS },
    ),
  )
