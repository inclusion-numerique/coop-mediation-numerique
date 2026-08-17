import type { AdresseRdv } from './adresse-rdv'
import type { DureeEnMinutes } from './duree-en-minutes'
import type { NomAtelier } from './libelle'
import type { Motif } from './motif'
import type { NombreParticipantsMax } from './nombre-participants-max'
import type { OrganisationId } from './organisation-id'
import type { Participation } from './participation'
import type { RdvAgentId } from './rdv-agent-id'
import type { RdvId } from './rdv-id'
import type { RdvUuid } from './rdv-uuid'
import type { StatutPresence } from './statut-presence'
import { type StatutRdv, statutRdv } from './statut-rdv'
import type { UrlAgent } from './url-agent'

type RdvBase = {
  readonly id: RdvId
  readonly uuid: RdvUuid
  /** Compte par lequel le rendez-vous a été synchronisé. */
  readonly agentId: RdvAgentId
  readonly organisationId: OrganisationId
  /**
   * Absente pour 882 des 44 627 rendez-vous synchronisés : RDV Service Public
   * envoie une chaîne vide quand le rendez-vous n'a pas de lieu physique.
   */
  readonly adresse: AdresseRdv | null
  readonly debut: Date
  readonly fin: Date
  readonly duree: DureeEnMinutes
  readonly statutPresence: StatutPresence
  readonly urlAgent: UrlAgent
  /** Renseigné quand le rendez-vous a été annulé, quelle qu'en soit la partie. */
  readonly annulation: Date | null
  /** Absent pour un rendez-vous créé hors de tout motif paramétré. */
  readonly motif: Motif | null
  readonly participations: readonly Participation[]
}

export type RdvIndividuel = RdvBase & {
  readonly collectif: false
}

/**
 * `nom` et `participantsMax` n'existent que pour un rendez-vous collectif : hors
 * de ce cas ils sont toujours vides côté RDV Service Public, et les porter dans
 * une entité unique obligerait chaque lecteur à se demander s'ils sont
 * significatifs (DM-4). Ils restent nullables à l'intérieur de la branche, car
 * RDV SP ne garantit ni l'un ni l'autre sur un atelier.
 */
export type RdvCollectif = RdvBase & {
  readonly collectif: true
  readonly nom: NomAtelier | null
  readonly participantsMax: NombreParticipantsMax | null
}

export type Rdv = RdvIndividuel | RdvCollectif

export const estCollectif = (rdv: Rdv): rdv is RdvCollectif => rdv.collectif

/**
 * Statut à afficher pour ce rendez-vous. Dérivé à la lecture plutôt que stocké :
 * voir `statutRdv`.
 */
export const statutAffiche = (rdv: Rdv, maintenant: Date): StatutRdv =>
  statutRdv(rdv.statutPresence, rdv.fin, maintenant)

/**
 * Un rendez-vous annulé l'est du point de vue de RDV Service Public, quel que
 * soit le statut de présence saisi par ailleurs.
 */
export const estAnnule = (rdv: Rdv): boolean => rdv.annulation !== null
