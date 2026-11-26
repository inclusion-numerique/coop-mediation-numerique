import type { CompteRdv } from '../../../domain/compte/compte-rdv'
import type { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import type { RdvId } from '../../../domain/identifiants/rdv-id'
import type { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import type { RdvServicePublicApi } from '../../../domain/ports'
import type { StatutRdvEnregistre } from './statut-rdv-enregistre'

export type ContexteMiseAJourStatut = (lecture: {
  readonly utilisateurId: UtilisateurCoopId
  readonly rdvId: RdvId
}) => Promise<{
  readonly compte: CompteRdv | null
  readonly agentIdDuRdv: RdvAgentId | null
}>

export type EnregistrerStatutRdv = (
  enregistrement: StatutRdvEnregistre,
) => Promise<void>

export type MettreAJourStatutRdvPorts = {
  readonly contexte: ContexteMiseAJourStatut
  readonly changerStatutRdv: RdvServicePublicApi['changerStatutRdv']
  readonly enregistrer: EnregistrerStatutRdv
}
