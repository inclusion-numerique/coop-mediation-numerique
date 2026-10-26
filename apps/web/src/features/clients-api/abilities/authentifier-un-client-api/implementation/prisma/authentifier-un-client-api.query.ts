import {
  clientApiSelect,
  versClientApi,
} from '@app/web/features/clients-api/db/client-api.transfer'
import {
  ClientApiId,
  couvre,
  estValideLe,
  type PorteeApi,
} from '@app/web/features/clients-api/domain'
import { prismaClient } from '@app/web/prismaClient'
import { verifySecret } from '@app/web/security/hashSecret'

export const authentifierUnClientApi = async ({
  clientApiId,
  secret,
  portees,
  maintenant = new Date(),
}: {
  readonly clientApiId: string
  readonly secret: string
  readonly portees: readonly PorteeApi[]
  readonly maintenant?: Date
}): Promise<boolean> => {
  const id = ClientApiId.safe(clientApiId)
  const ligne =
    id === null
      ? null
      : await prismaClient.apiClient.findUnique({
          where: { id },
          select: { ...clientApiSelect, secretHash: true },
        })

  if (ligne === null || !verifySecret(secret, ligne.secretHash)) return false

  const client = versClientApi(ligne)
  return estValideLe(client.validite, maintenant) && couvre(client, portees)
}
