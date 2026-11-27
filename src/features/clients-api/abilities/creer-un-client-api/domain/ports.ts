import type {
  ClientApi,
  DefinitionDuClientApi,
  GenererUnSecret,
  LeNomEstPris,
} from '@/features/clients-api/domain'

export type EnregistrerLeClientApi = (nouveau: {
  readonly definition: DefinitionDuClientApi
  readonly secretHash: string
}) => Promise<ClientApi>

export type CreerUnClientApiPorts = {
  readonly leNomEstPris: LeNomEstPris
  readonly genererUnSecret: GenererUnSecret
  readonly enregistrer: EnregistrerLeClientApi
}
