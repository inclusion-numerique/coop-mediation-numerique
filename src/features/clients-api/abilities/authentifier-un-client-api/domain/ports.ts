import type { ClientApi, ClientApiId } from '@/features/clients-api/domain'

export type ClientApiAAuthentifier = Pick<
  ClientApi,
  'id' | 'portees' | 'validite'
> & {
  readonly secretHash: string
}

export type LireLeClientApiAAuthentifier = (
  id: ClientApiId,
) => Promise<ClientApiAAuthentifier | null>

export type VerifierUnSecret = (secret: string, secretHash: string) => boolean

export type AuthentifierUnClientApiPorts = {
  readonly lireLeClientApiAAuthentifier: LireLeClientApiAAuthentifier
  readonly verifierUnSecret: VerifierUnSecret
}
