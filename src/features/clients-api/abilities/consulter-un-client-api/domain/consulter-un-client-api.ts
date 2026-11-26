import {
  type ClientApi,
  ClientApiId,
  ClientApiIntrouvable,
} from '@/features/clients-api/domain'
import { failure, type Result, success } from '@/libraries/result'

export type LireLeClientApi = (id: ClientApiId) => Promise<ClientApi | null>

export const consulterUnClientApi =
  ({ lireLeClientApi }: { readonly lireLeClientApi: LireLeClientApi }) =>
  async (
    clientApiId: string,
  ): Promise<Result<ClientApi, ClientApiIntrouvable>> => {
    const id = ClientApiId.safe(clientApiId)
    const client = id === null ? null : await lireLeClientApi(id)

    return client === null
      ? failure(ClientApiIntrouvable(clientApiId))
      : success(client)
  }
