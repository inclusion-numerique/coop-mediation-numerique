import { failure, type Result, success } from '@app/web/libraries/result'
import {
  type CompteRdv,
  type CompteRdvUtilisable,
  estUtilisable,
} from '../../../domain/compte-rdv'
import {
  CompteNonLie,
  type ErreurRdvApi,
  RdvIntrouvable,
} from '../../../domain/errors'
import type { RdvAgentId } from '../../../domain/rdv-agent-id'
import type { RdvId } from '../../../domain/rdv-id'
import type {
  StatutPresence,
  StatutPresenceModifiable,
} from '../../../domain/statut-presence'
import type { UtilisateurCoopId } from '../../../domain/utilisateur-coop-id'
import { RdvNonAutorise } from './errors'

export type ErreurMiseAJourStatut = RdvNonAutorise | ErreurRdvApi

export type MettreAJourStatutRdv = (input: {
  readonly utilisateurId: UtilisateurCoopId
  readonly rdvId: RdvId
  readonly statut: StatutPresenceModifiable
}) => Promise<Result<StatutRdvMisAJour, ErreurMiseAJourStatut>>

/** Compte du médiateur et propriétaire du rendez-vous visé, lus d'un seul tenant. */
export type ContexteMiseAJourStatut = (input: {
  readonly utilisateurId: UtilisateurCoopId
  readonly rdvId: RdvId
}) => Promise<{
  readonly compte: CompteRdv | null
  readonly agentIdDuRdv: RdvAgentId | null
}>

export type StatutRdvMisAJour = {
  readonly statutPresence: StatutPresence
  readonly craRefuse: boolean
}

export type EnregistrerStatutRdv = (input: {
  readonly rdvId: RdvId
  readonly statut: StatutRdvMisAJour
}) => Promise<void>

/**
 * Autorise — ou non — l'écriture sur ce rendez-vous.
 *
 * Trois refus distincts, dans cet ordre : sans compte exploitable rien ne peut
 * partir vers RDV Service Public ; un rendez-vous inconnu de La Coop n'est pas
 * modifiable ; un rendez-vous connu mais rattaché à un autre agent ne l'est pas
 * davantage. La règle est ici, et non dans la requête, pour être vérifiable sans
 * base — c'est du contrôle d'accès, la partie qu'on ne veut pas découvrir en
 * production.
 */
export const verifierAcces = ({
  compte,
  agentIdDuRdv,
  rdvId,
}: {
  compte: CompteRdv | null
  agentIdDuRdv: RdvAgentId | null
  rdvId: RdvId
}): Result<CompteRdvUtilisable, ErreurMiseAJourStatut> => {
  if (compte === null) {
    return failure(CompteNonLie(null))
  }

  if (!estUtilisable(compte)) {
    return failure(CompteNonLie(compte.agentId))
  }

  if (agentIdDuRdv === null) {
    return failure(RdvIntrouvable(rdvId))
  }

  if (agentIdDuRdv !== compte.agentId) {
    return failure(RdvNonAutorise(rdvId))
  }

  return success(compte)
}

/**
 * État à enregistrer une fois le statut confirmé par RDV Service Public.
 *
 * Déclarer un rendez-vous honoré depuis ce parcours, c'est avoir explicitement
 * écarté la rédaction d'un CRA — la modale n'offre ce chemin qu'en regard de
 * « Renseigner un CRA pour ce RDV ». Le drapeau retient ce choix pour que
 * l'invitation ne revienne pas. Les autres statuts le lèvent : un rendez-vous
 * annulé n'appelle aucun CRA, donc aucun refus à mémoriser.
 */
export const statutRdvMisAJour = (
  statutConfirme: StatutPresence,
): StatutRdvMisAJour => ({
  statutPresence: statutConfirme,
  craRefuse: statutConfirme === 'seen',
})
