import type { EtapeDInscription, Role } from '@/features/inscription/domain'
import type { EnregistrerProfilChoisiInput } from './ports'

export type ProfilChoisi = {
  readonly role: Role
  readonly etapeSuivante: EtapeDInscription
  readonly aEnregistrer: EnregistrerProfilChoisiInput
}
