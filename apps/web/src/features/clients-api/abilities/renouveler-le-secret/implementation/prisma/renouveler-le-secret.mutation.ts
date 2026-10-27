import {
  ClientApiId,
  ClientApiIntrouvable,
} from '@app/web/features/clients-api/domain'
import { nouveauSecret } from '@app/web/features/clients-api/implementation/secret'
import { failure, type Result, success } from '@app/web/libraries/result'
import { prismaClient } from '@app/web/prismaClient'

export const renouvelerLeSecret = async ({
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

  if (id === null || !existe) return failure(ClientApiIntrouvable(clientApiId))

  const { secret, secretHash } = nouveauSecret()
  await prismaClient.apiClient.update({
    where: { id },
    data: { secretHash, updated: maintenant },
  })

  return success({ clientApiId: id, secret })
}
