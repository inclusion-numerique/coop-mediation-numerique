import { prismaClient } from '@/configuration/prisma'
import {
  ClientApiId,
  type IssueDAuthentification,
  issueDAuthentification,
  type PorteeApi,
} from '@/features/clients-api/domain'
import {
  clientApiSelect,
  versClientApi,
} from '@/features/clients-api/implementations/prisma/client-api.transfer'
import { verifySecret } from '@/features/clients-api/implementations/secret/hash-secret.adapter'

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
}): Promise<IssueDAuthentification> => {
  const id = ClientApiId.safe(clientApiId)
  const ligne =
    id === null
      ? null
      : await prismaClient.apiClient.findUnique({
          where: { id },
          select: { ...clientApiSelect, secretHash: true },
        })

  if (ligne === null || !verifySecret(secret, ligne.secretHash))
    return 'NonAuthentifie'

  return issueDAuthentification(versClientApi(ligne), portees, maintenant)
}
