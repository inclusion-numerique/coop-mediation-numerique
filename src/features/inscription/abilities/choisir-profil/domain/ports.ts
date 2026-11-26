import type { InscriptionEnCours } from '@/features/inscription/domain'
import type { LireLEtatDeLInscription } from '@/features/inscription/domain/ports'
import type { RolesACreer } from './roles-a-creer'

export type EnregistrerProfilChoisiInput = {
  readonly etat: InscriptionEnCours
  readonly roles: RolesACreer
}

export type EnregistrerProfilChoisi = (
  input: EnregistrerProfilChoisiInput,
) => Promise<void>

export type ChoisirProfilPorts = {
  readonly lireLEtat: LireLEtatDeLInscription
  readonly enregistrerProfilChoisi: EnregistrerProfilChoisi
}
