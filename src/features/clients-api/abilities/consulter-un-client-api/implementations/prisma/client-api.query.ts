import { prismaClient } from '@/configuration/prisma'
import {
  type ClientApi,
  ClientApiId,
  ClientApiIntrouvable,
} from '@/features/clients-api/domain'
import {
  clientApiSelect,
  versClientApi,
} from '@/features/clients-api/implementations/prisma/client-api.transfer'
import { failure, type Result, success } from '@/libraries/result'

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
