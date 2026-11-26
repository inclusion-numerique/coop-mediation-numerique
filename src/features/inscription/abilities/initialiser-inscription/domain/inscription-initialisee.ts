import type {
  EtapeDInscription,
  ProfilInscription,
} from '@/features/inscription/domain'
import type { Siret } from '@/libraries/insee'

export type InscriptionInitialisee = {
  readonly profilEnregistre: ProfilInscription | null
  readonly mediateurGaranti: boolean
  readonly siretRattache: Siret | null
  readonly nextStep: EtapeDInscription
}
