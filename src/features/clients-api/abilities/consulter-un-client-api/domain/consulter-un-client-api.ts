import {
  type ClientApi,
  type ClientApiId,
  ClientApiIntrouvable,
} from '@/features/clients-api/domain'
import { failure, type Result, success } from '@/libraries/result'
import type { EchecDeConsulterUnClientApi } from './errors'
import type { ConsulterUnClientApiPorts } from './ports'

export const consulterUnClientApi =
  ({ lireLeClientApi }: ConsulterUnClientApiPorts) =>
  async ({
    clientApiId,
  }: {
    readonly clientApiId: ClientApiId | null
  }): Promise<Result<ClientApi, EchecDeConsulterUnClientApi>> => {
    const client =
      clientApiId === null ? null : await lireLeClientApi(clientApiId)

    return client === null ? failure(ClientApiIntrouvable()) : success(client)
  }
