import type { CompteRdvLie } from '../../../domain/compte/compte-rdv'
import type { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'

export type CompteConnecte = {
  readonly compte: CompteRdvLie
  readonly agentIdPrecedent: RdvAgentId | null
}
