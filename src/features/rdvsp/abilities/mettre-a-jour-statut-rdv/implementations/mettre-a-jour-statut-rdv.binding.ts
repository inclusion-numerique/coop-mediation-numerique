import { rdvServicePublicApi } from '@/features/rdvsp/implementations/api/rdv-service-public.client'
import { configurationRdvServicePublic } from '@/features/rdvsp/implementations/api/rdv-service-public-configuration.client'
import { enregistrerLesJetons } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.mutation'
import { jetonsCourants } from '@/features/rdvsp/implementations/prisma/jetons-du-compte.query'
import { mettreAJourStatutRdv } from '../domain/mettre-a-jour-statut-rdv'
import { contexteMiseAJourStatut } from './prisma/contexte-mise-a-jour-statut.query'
import { enregistrerStatutRdv } from './prisma/enregistrer-statut-rdv.mutation'

/**
 * Composition de l'ability avec ses adaptateurs réels, partagée par la server
 * action et par le routeur des comptes rendus d'activité : deux appelants, deux
 * couches, et rien qui signalerait que les copies doivent rester identiques.
 *
 * À importer par ce chemin explicite : le module tire Prisma et la configuration
 * de l'API, qu'un composant client ne doit jamais embarquer.
 */
export const mettreAJourStatutRdvBinding = mettreAJourStatutRdv({
  contexte: contexteMiseAJourStatut,
  changerStatutRdv: rdvServicePublicApi({
    ...configurationRdvServicePublic(),
    onJetonsRenouveles: enregistrerLesJetons,
    jetonsCourants,
  }).changerStatutRdv,
  enregistrer: enregistrerStatutRdv,
})
