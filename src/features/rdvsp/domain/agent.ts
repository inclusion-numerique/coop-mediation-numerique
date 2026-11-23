import type { RdvAgentId } from './identifiants/rdv-agent-id'
import type { EmailExterne, NomExterne, PrenomExterne } from './identite'

/**
 * L'agent RDV Service Public derrière un compte La Coop. Son e-mail est la clé
 * de rapprochement retenue avec RDV SP quand les SIRET divergent : le connecteur
 * refuse la liaison si celui-ci ne correspond pas au compte La Coop.
 */
export type Agent = {
  readonly id: RdvAgentId
  readonly email: EmailExterne
  readonly prenom: PrenomExterne
  readonly nom: NomExterne
}
