import type { UsagerId } from '../../../domain/identifiants/usager-id'
import type {
  DemandeRdv,
  DemandeRdvCreee,
} from '../../../domain/rdv/demande-rdv'
import type { BeneficiaireCible } from './beneficiaire-cible'

export type LiaisonUsager = {
  readonly beneficiaire: BeneficiaireCible
  readonly usagerId: UsagerId
}

export type RendezVousDemande = {
  readonly demande: DemandeRdv
  readonly creee: DemandeRdvCreee
  readonly liaison: LiaisonUsager
}
