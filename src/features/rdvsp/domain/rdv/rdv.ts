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
  readonly agentId: RdvAgentId
  readonly organisationId: OrganisationId
  readonly adresse: AdresseRdv | null
  readonly debut: Date
  readonly fin: Date
  readonly duree: DureeEnMinutes
  readonly statutPresence: StatutPresence
  readonly urlAgent: UrlAgent
  readonly nombreParticipants: number
  readonly contexte: string | null
  readonly creeParId: number | null
  readonly annulation: Date | null
  readonly motif: Motif | null
  readonly lieu: Lieu | null
  readonly participations: readonly Participation[]
}

type RdvIndividuel = RdvBase & {
  readonly collectif: false
}

type RdvCollectif = RdvBase & {
  readonly collectif: true
  readonly nom: NomAtelier | null
  readonly participantsMax: NombreParticipantsMax | null
}

export type Rdv = RdvIndividuel | RdvCollectif

export type RdvSynchronise = {
  readonly rdv: Rdv
  readonly brut: unknown
}
