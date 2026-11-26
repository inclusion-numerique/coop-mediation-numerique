import type { JetonsOAuth } from '../../../domain/compte/jetons-oauth'
import type { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import type { RdvId } from '../../../domain/identifiants/rdv-id'
import type { UsagerId } from '../../../domain/identifiants/usager-id'
import type { UtilisateurCoopId } from '../../../domain/identifiants/utilisateur-coop-id'
import type { RevoquerJetons } from '../../../domain/ports'

export type CompteAEffacer = (utilisateurId: UtilisateurCoopId) => Promise<{
  readonly agentId: RdvAgentId
  readonly jetons: JetonsOAuth | null
} | null>

export type RendezVousDuCompte = (agentId: RdvAgentId) => Promise<{
  readonly rdvIds: readonly RdvId[]
  readonly usagerIds: readonly UsagerId[]
}>

export type SupprimerLeCompteRdv = (agentId: RdvAgentId) => Promise<void>

export type UsagersOrphelinsParmi = (
  usagerIds: readonly UsagerId[],
) => Promise<readonly UsagerId[]>

export type SupprimerLesUsagers = (
  usagerIds: readonly UsagerId[],
) => Promise<void>

export type EffacerEmpreinteRdvPorts = {
  readonly compteAEffacer: CompteAEffacer
  readonly revoquerJetons: RevoquerJetons
  readonly rendezVousDuCompte: RendezVousDuCompte
  readonly supprimerLeCompte: SupprimerLeCompteRdv
  readonly usagersOrphelinsParmi: UsagersOrphelinsParmi
  readonly supprimerLesUsagers: SupprimerLesUsagers
}
