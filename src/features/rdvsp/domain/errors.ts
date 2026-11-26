import { messageDe } from '@/libraries/result'
import type { OrganisationId } from './identifiants/organisation-id'
import type { RdvAgentId } from './identifiants/rdv-agent-id'
import type { RdvId } from './identifiants/rdv-id'
import type { UtilisateurCoopId } from './identifiants/utilisateur-coop-id'

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

export type AccesRefuse = {
  readonly _tag: 'AccesRefuse'
  readonly chemin: string
  readonly organisationId: OrganisationId | null
}

export const AccesRefuse = (
  chemin: string,
  organisationId: OrganisationId | null,
): AccesRefuse => ({ _tag: 'AccesRefuse', chemin, organisationId })

export type AgentSupprime = {
  readonly _tag: 'AgentSupprime'
  readonly chemin: string
}

export const AgentSupprime = (chemin: string): AgentSupprime => ({
  _tag: 'AgentSupprime',
  chemin,
})

export type CompteRdvIntrouvable = {
  readonly _tag: 'CompteRdvIntrouvable'
  readonly utilisateurId: UtilisateurCoopId
}

export const CompteRdvIntrouvable = (
  utilisateurId: UtilisateurCoopId,
): CompteRdvIntrouvable => ({ _tag: 'CompteRdvIntrouvable', utilisateurId })

export type RdvNonAutorise = {
  readonly _tag: 'RdvNonAutorise'
  readonly rdvId: RdvId
}

export const RdvNonAutorise = (rdvId: RdvId): RdvNonAutorise => ({
  _tag: 'RdvNonAutorise',
  rdvId,
})

export type PayloadInexploitable = { readonly _tag: 'PayloadInexploitable' }

export const PayloadInexploitable = (): PayloadInexploitable => ({
  _tag: 'PayloadInexploitable',
})

export type RapprochementEchoue = {
  readonly _tag: 'RapprochementEchoue'
  readonly message: string
}

export const RapprochementEchoue = (message: string): RapprochementEchoue => ({
  _tag: 'RapprochementEchoue',
  message,
})

export type ErreurRdvApi =
  | JetonRevoque
  | AccesRefuse
  | AgentSupprime
  | ApiIndisponible
  | ReponseInattendue
  | CompteNonLie
  | RdvIntrouvable

export type ErreurTechnique = {
  readonly _tag: 'ErreurTechnique'
  readonly erreur: unknown
}

export const ErreurTechnique = (erreur: unknown): ErreurTechnique => ({
  _tag: 'ErreurTechnique',
  erreur,
})

export type EchecDeSynchronisation = ErreurRdvApi | ErreurTechnique

const detailErreur = (erreur: ErreurRdvApi): string | null => {
  if (erreur._tag === 'AccesRefuse' || erreur._tag === 'AgentSupprime') {
    return erreur.chemin
  }

  if (erreur._tag === 'ApiIndisponible') {
    return `${erreur.statusCode} ${erreur.message}`
  }

  return erreur._tag === 'ReponseInattendue'
    ? `${erreur.chemin} ${erreur.detail}`
    : null
}

export const diagnosticErreur = (erreur: ErreurRdvApi): string => {
  const detail = detailErreur(erreur)

  return detail === null ? erreur._tag : `${erreur._tag} : ${detail}`
}

export const messageDeLEchec = (echec: EchecDeSynchronisation): string => {
  if (echec._tag !== 'ErreurTechnique') return diagnosticErreur(echec)

  return messageDe(echec.erreur)
}
