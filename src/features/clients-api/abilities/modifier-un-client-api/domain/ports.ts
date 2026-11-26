import type {
  ClientApiExiste,
  LeNomEstPris,
} from '@/features/clients-api/domain'
import type { ModificationDuClientApi } from './modification-du-client-api'

export type EnregistrerLaModification = (
  modification: ModificationDuClientApi,
) => Promise<void>

export type ModifierUnClientApiPorts = {
  readonly clientApiExiste: ClientApiExiste
  readonly leNomEstPris: LeNomEstPris
  readonly enregistrer: EnregistrerLaModification
}
