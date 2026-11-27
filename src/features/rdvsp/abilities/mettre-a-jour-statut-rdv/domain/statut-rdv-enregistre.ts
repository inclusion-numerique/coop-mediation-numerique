import type { RdvId } from '../../../domain/identifiants/rdv-id'
import type { StatutPresence } from '../../../domain/rdv/statut-presence'

export type StatutRdvMisAJour = {
  readonly statutPresence: StatutPresence
  readonly compteRenduRegle: boolean
}

export type StatutRdvEnregistre = {
  readonly rdvId: RdvId
  readonly statut: StatutRdvMisAJour
}
