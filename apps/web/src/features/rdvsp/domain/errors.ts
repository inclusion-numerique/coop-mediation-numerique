import type { RdvAgentId } from './rdv-agent-id'
import type { RdvId } from './rdv-id'

/**
 * Le client actuel réduit tout échec à `{ status: 'error', error: string }`, ce
 * qui empêche l'appelant de distinguer un jeton révoqué — qui appelle une
 * reconnexion de l'utilisateur — d'une indisponibilité passagère, qui appelle un
 * simple réessai. Ces erreurs typées rendent la différence exploitable.
 */

export type JetonRevoque = {
  readonly _tag: 'JetonRevoque'
  /**
   * Absent pendant la liaison de compte : les jetons sont refusés avant même que
   * l'agent auquel ils appartiennent ait pu être identifié.
   */
  readonly agentId: RdvAgentId | null
}

export const JetonRevoque = (agentId: RdvAgentId | null): JetonRevoque => ({
  _tag: 'JetonRevoque',
  agentId,
})

export type ApiIndisponible = {
  readonly _tag: 'ApiIndisponible'
  readonly statusCode: number
  readonly message: string
}

export const ApiIndisponible = (
  statusCode: number,
  message: string,
): ApiIndisponible => ({ _tag: 'ApiIndisponible', statusCode, message })

/**
 * Réponse reçue mais non conforme au contrat attendu : champ obligatoire absent,
 * type inattendu. C'est le signal qu'une évolution d'API est passée sans nous.
 */
export type ReponseInattendue = {
  readonly _tag: 'ReponseInattendue'
  readonly chemin: string
  readonly detail: string
}

export const ReponseInattendue = (
  chemin: string,
  detail: string,
): ReponseInattendue => ({ _tag: 'ReponseInattendue', chemin, detail })

/**
 * Appel tenté sans jetons exploitables : compte jamais lié, délié, ou tout
 * simplement inexistant — d'où un `agentId` absent dans ce dernier cas, l'agent
 * n'ayant alors jamais été connu de La Coop.
 */
export type CompteNonLie = {
  readonly _tag: 'CompteNonLie'
  readonly agentId: RdvAgentId | null
}

export const CompteNonLie = (agentId: RdvAgentId | null): CompteNonLie => ({
  _tag: 'CompteNonLie',
  agentId,
})

export type RdvIntrouvable = {
  readonly _tag: 'RdvIntrouvable'
  readonly id: RdvId
}

export const RdvIntrouvable = (id: RdvId): RdvIntrouvable => ({
  _tag: 'RdvIntrouvable',
  id,
})

export type ErreurRdvApi =
  | JetonRevoque
  | ApiIndisponible
  | ReponseInattendue
  | CompteNonLie
  | RdvIntrouvable
