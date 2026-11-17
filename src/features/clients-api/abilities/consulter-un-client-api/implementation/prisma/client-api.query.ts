import {
  clientApiSelect,
  versClientApi,
} from '@/features/clients-api/db/client-api.transfer'
import {
  type ClientApi,
  ClientApiId,
  ClientApiIntrouvable,
} from '@/features/clients-api/domain'
import { failure, type Result, success } from '@/libraries/result'
import { prismaClient } from '@/prismaClient'

export const consulterUnClientApi = async (
  clientApiId: string,
): Promise<Result<ClientApi, ClientApiIntrouvable>> => {
  const id = ClientApiId.safe(clientApiId)
  const ligne =
    id === null
      ? null
      : await prismaClient.apiClient.findUnique({
          where: { id },
          select: clientApiSelect,
        })

  return ligne === null
    ? failure(ClientApiIntrouvable(clientApiId))
    : success(versClientApi(ligne))
}
