import type {
  EtapeDInscription,
  ProfilInscription,
} from '@/features/inscription/domain'
import type { Siret } from '@/libraries/insee'
import type { GarantieDuRoleCoordinateur } from './ports'

export type RattachementParSiret<Rattachement, Echec> =
  | { readonly _tag: 'SansSiret' }
  | { readonly _tag: 'EmployeuseDejaConnue' }
  | {
      readonly _tag: 'Rattache'
      readonly siret: Siret
      readonly rattachement: Rattachement
    }
  | {
      readonly _tag: 'NonRattache'
      readonly siret: Siret
      readonly echec: Echec
    }

export type InscriptionInitialisee<Rattachement, Echec> = {
  readonly profilEnregistre: ProfilInscription | null
  readonly roleCoordinateur: GarantieDuRoleCoordinateur
  readonly mediateurGaranti: boolean
  readonly rattachementParSiret: RattachementParSiret<Rattachement, Echec>
  readonly nextStep: EtapeDInscription
}
