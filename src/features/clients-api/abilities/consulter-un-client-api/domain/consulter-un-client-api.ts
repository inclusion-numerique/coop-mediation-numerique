import {
  type ClientApi,
  ClientApiId,
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
    readonly clientApiId: string
  }): Promise<Result<ClientApi, EchecDeConsulterUnClientApi>> => {
    const id = ClientApiId.safe(clientApiId)
    const client = id === null ? null : await lireLeClientApi(id)

    return client === null
      ? failure(ClientApiIntrouvable(clientApiId))
      : success(client)
  }
