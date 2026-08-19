import { success } from '@app/web/libraries/result'
import type { RdvServicePublicApi } from '../../../domain/rdv-service-public.port'
import {
  type ContexteMiseAJourStatut,
  type EnregistrerStatutRdv,
  type MettreAJourStatutRdv,
  statutRdvMisAJour,
  verifierAcces,
} from '../domain/mettre-a-jour-statut-rdv'

export type DependancesMettreAJourStatutRdv = {
  readonly contexte: ContexteMiseAJourStatut
  readonly changerStatutRdv: RdvServicePublicApi['changerStatutRdv']
  readonly enregistrer: EnregistrerStatutRdv
}

/**
 * RDV Service Public est prévenu avant que La Coop n'écrive quoi que ce soit, et
 * c'est le statut qu'il renvoie qui est enregistré, jamais celui demandé : lui
 * seul fait autorité sur ses rendez-vous. Un échec de son côté laisse donc la
 * base intacte plutôt que d'y inscrire une valeur qu'il ignore.
 */
export const mettreAJourStatutRdv =
  ({
    contexte,
    changerStatutRdv,
    enregistrer,
  }: DependancesMettreAJourStatutRdv): MettreAJourStatutRdv =>
  async ({ utilisateurId, rdvId, statut }) => {
    const { compte, agentIdDuRdv } = await contexte({ utilisateurId, rdvId })

    const acces = verifierAcces({ compte, agentIdDuRdv, rdvId })

    if (!acces.success) {
      return acces
    }

    const confirmation = await changerStatutRdv(acces.data, rdvId, statut)

    if (!confirmation.success) {
      return confirmation
    }

    const misAJour = statutRdvMisAJour(confirmation.data)

    await enregistrer({ rdvId, statut: misAJour })

    return success(misAJour)
  }
