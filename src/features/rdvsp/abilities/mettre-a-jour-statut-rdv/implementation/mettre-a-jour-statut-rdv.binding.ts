import { rdvServicePublicApiBinding } from '../../../implementation/rdv-service-public.bindings'
import { mettreAJourStatutRdv } from './mettre-a-jour-statut-rdv'
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
  changerStatutRdv: rdvServicePublicApiBinding.changerStatutRdv,
  enregistrer: enregistrerStatutRdv,
})
