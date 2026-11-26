import type { RdvAgentId } from './identifiants/rdv-agent-id'
import type { EmailExterne, NomExterne, PrenomExterne } from './identite'

export type Agent = {
  readonly id: RdvAgentId
  readonly email: EmailExterne
  readonly prenom: PrenomExterne
  readonly nom: NomExterne
}
