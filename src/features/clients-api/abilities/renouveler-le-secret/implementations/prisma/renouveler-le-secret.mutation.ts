import { prismaClient } from '@/configuration/prisma'
import {
  ClientApiId,
  ClientApiIntrouvable,
  type GenererUnSecret,
} from '@/features/clients-api/domain'
import { failure, type Result, success } from '@/libraries/result'

export const renouvelerLeSecret =
  (nouveauSecret: GenererUnSecret) =>
  async ({
    clientApiId,
    maintenant = new Date(),
  }: {
    readonly clientApiId: string
    readonly maintenant?: Date
  }): Promise<
    Result<
      { readonly clientApiId: ClientApiId; readonly secret: string },
      ClientApiIntrouvable
    >
  > => {
    const id = ClientApiId.safe(clientApiId)
    const existe =
      id !== null && (await prismaClient.apiClient.count({ where: { id } })) > 0

    if (id === null || !existe)
      return failure(ClientApiIntrouvable(clientApiId))

    const { secret, secretHash } = nouveauSecret()
    await prismaClient.apiClient.update({
      where: { id },
      data: { secretHash, updated: maintenant },
    })

    return success({ clientApiId: id, secret })
  }
