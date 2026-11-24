import type { OrganisationId } from '../identifiants/organisation-id'
import type { RdvAgentId } from '../identifiants/rdv-agent-id'
import type { RdvId } from '../identifiants/rdv-id'
import type { RdvUuid } from '../identifiants/rdv-uuid'
import type { NomAtelier } from '../libelle'
import type { UrlAgent } from '../url-agent'
import type { AdresseRdv } from './adresse-rdv'
import type { DureeEnMinutes } from './duree-en-minutes'
import type { Lieu } from './lieu'
import type { Motif } from './motif'
import type { NombreParticipantsMax } from './nombre-participants-max'
import type { Participation } from './participation'
import type { StatutPresence } from './statut-presence'

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
  /** Nombre d'usagers attendus, tel que RDV Service Public le décompte. */
  readonly nombreParticipants: number
  /** Note libre saisie par l'agent, recopiée sans être interprétée. */
  readonly contexte: string | null
  /** Auteur de la prise de rendez-vous, côté RDV Service Public. */
  readonly creeParId: number | null
  /** Renseigné quand le rendez-vous a été annulé, quelle qu'en soit la partie. */
  readonly annulation: Date | null
  /** Absent pour un rendez-vous créé hors de tout motif paramétré. */
  readonly motif: Motif | null
  /** Absent pour un rendez-vous sans lieu physique — à distance, par téléphone. */
  readonly lieu: Lieu | null
  readonly participations: readonly Participation[]
}

type RdvIndividuel = RdvBase & {
  readonly collectif: false
}

/**
 * `nom` et `participantsMax` n'existent que pour un rendez-vous collectif : hors
 * de ce cas ils sont toujours vides côté RDV Service Public, et les porter dans
 * une entité unique obligerait chaque lecteur à se demander s'ils sont
 * significatifs (DM-4). Ils restent nullables à l'intérieur de la branche, car
 * RDV SP ne garantit ni l'un ni l'autre sur un atelier.
 */
type RdvCollectif = RdvBase & {
  readonly collectif: true
  readonly nom: NomAtelier | null
  readonly participantsMax: NombreParticipantsMax | null
}

export type Rdv = RdvIndividuel | RdvCollectif

/**
 * Rendez-vous tel que la synchronisation le reçoit : l'entité, et le payload
 * d'origine que La Coop conserve en base à titre de trace. Le brut n'est jamais
 * interprété — il n'existe que pour pouvoir relire ce que le service a envoyé le
 * jour où une donnée surprend.
 */
export type RdvSynchronise = {
  readonly rdv: Rdv
  readonly brut: unknown
}
