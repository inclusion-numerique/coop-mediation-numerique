import type { OrganisationId } from '../../../domain/identifiants/organisation-id'
import type { RdvId } from '../../../domain/identifiants/rdv-id'
import type { StatutPresence } from '../../../domain/rdv/statut-presence'

export type RdvEnUneLigne = {
  readonly id: RdvId
  readonly debut: Date
  readonly fin: Date
  readonly collectif: boolean
  readonly nombreParticipants: number
  readonly premierParticipant: {
    readonly prenom: string
    readonly nom: string
  } | null
  readonly statutPresence: StatutPresence
}

export type DonneesAccueilRdv = {
  readonly aVenir: number
  readonly prochain: RdvEnUneLigne | null
  readonly passes: number
  readonly honores: number
  readonly dernier: RdvEnUneLigne | null
  readonly organisationPrincipale: {
    readonly id: OrganisationId
    readonly nom: string
  } | null
}

export const rdvsPassesTotal = (donnees: DonneesAccueilRdv): number =>
  donnees.passes + donnees.honores
