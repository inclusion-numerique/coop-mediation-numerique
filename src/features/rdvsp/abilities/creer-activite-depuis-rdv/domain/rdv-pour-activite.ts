import type { BeneficiaireId } from '../../../domain/identifiants/beneficiaire-id'
import type { MediateurId } from '../../../domain/identifiants/mediateur-id'
import type { RdvAgentId } from '../../../domain/identifiants/rdv-agent-id'
import type { RdvId } from '../../../domain/identifiants/rdv-id'
import type { UsagerId } from '../../../domain/identifiants/usager-id'
import type {
  EmailExterne,
  NomExterne,
  PrenomExterne,
  TelephoneExterne,
} from '../../../domain/identite'
import type { StatutPresence } from '../../../domain/rdv/statut-presence'

export type UsagerDuRdv = {
  readonly id: UsagerId
  readonly prenom: PrenomExterne | null
  readonly nom: NomExterne | null
  readonly email: EmailExterne | null
  readonly telephone: TelephoneExterne | null
  readonly adresse: string | null
  readonly dateNaissance: Date | null
}

export type ParticipationDuRdv = {
  readonly statutPresence: StatutPresence
  readonly usager: UsagerDuRdv
}

export type RdvPourActivite = {
  readonly id: RdvId
  readonly agentId: RdvAgentId
  readonly statutPresence: StatutPresence
  readonly participations: readonly ParticipationDuRdv[]
  readonly debut: Date
  readonly dureeEnMinutes: number
  readonly titre: string | null
  readonly collectif: boolean
}

export type BeneficiaireFusionne = {
  readonly id: BeneficiaireId
  readonly prenom: string | null
  readonly nom: string | null
  readonly email: string | null
  readonly telephone: string | null
  readonly mediateurId: MediateurId
  readonly adresse: string | null
  readonly anneeNaissance: number | null
  readonly commune: string | null
}
