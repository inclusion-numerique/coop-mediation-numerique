import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'
import type { RdvAgentId } from '../../../domain/rdv-agent-id'
import type { RdvId } from '../../../domain/rdv-id'
import type { StatutPresence } from '../../../domain/statut-presence'
import type { UsagerId } from '../../../domain/usager-id'

export const MediateurRedacteurId = defineModel(
  z.string().uuid().brand('MediateurRedacteurId'),
)
export type MediateurRedacteurId = Model.TypeOf<typeof MediateurRedacteurId>

/**
 * Identité d'un usager telle qu'elle sera transmise à la feature bénéficiaire.
 * Les champs restent des chaînes brutes : c'est le domaine bénéficiaire qui les
 * valide, cette ability ne fait que les convoyer (IS-2).
 */
export type UsagerDuRdv = {
  readonly id: UsagerId
  readonly prenom: string
  readonly nom: string
  readonly email: string | null
  readonly telephone: string | null
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
  readonly participations: readonly ParticipationDuRdv[]
}

/**
 * Fiche rendue par la feature bénéficiaire après création ou fusion, puis
 * transmise telle quelle à la feature activités pour pré-remplir le CRA.
 *
 * Déclaration locale du contrat d'échange, et non import de leurs types : cette
 * ability n'interprète aucun de ces champs, elle les convoie d'une feature à
 * l'autre. Les tenir ici rend visible, si la forme change, qui doit s'y adapter.
 */
export type BeneficiaireFusionne = {
  readonly id: string
  readonly prenom: string | null
  readonly nom: string | null
  readonly email: string | null
  readonly telephone: string | null
  readonly mediateurId: string
  readonly adresse: string | null
  readonly anneeNaissance: number | null
  readonly commune: string | null
}
