import type { ClientApi, ClientApiId } from '@/features/clients-api/domain'

export type LireLeClientApi = (id: ClientApiId) => Promise<ClientApi | null>

export type ConsulterUnClientApiPorts = {
  readonly lireLeClientApi: LireLeClientApi
}
