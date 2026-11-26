import type {
  ClientApi,
  ClientApiExiste,
  ClientApiId,
  DefinitionDuClientApi,
  LeNomEstPris,
} from '@/features/clients-api/domain'

export type EnregistrerLaModification = (modification: {
  readonly id: ClientApiId
  readonly definition: DefinitionDuClientApi
}) => Promise<ClientApi>

export type ModifierUnClientApiPorts = {
  readonly clientApiExiste: ClientApiExiste
  readonly leNomEstPris: LeNomEstPris
  readonly enregistrer: EnregistrerLaModification
}
