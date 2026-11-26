import type {
  EtapeDInscription,
  ProfilInscription,
} from '@/features/inscription/domain'

export type InscriptionInitialisee = {
  readonly profilEnregistre: ProfilInscription | null
  readonly mediateurGaranti: boolean
  readonly siretRattache: string | null
  readonly nextStep: EtapeDInscription
}
