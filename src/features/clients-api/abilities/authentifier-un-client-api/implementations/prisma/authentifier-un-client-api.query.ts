import { prismaClient } from '@/configuration/prisma'
import {
  type AuthentifierUnClientApi,
  ClientApiId,
  issueDAuthentification,
  type VerifierUnSecret,
} from '@/features/clients-api/domain'
import {
  clientApiSelect,
  versClientApi,
} from '@/features/clients-api/implementations/prisma/client-api.transfer'

export const authentifierUnClientApi =
  (verifierLeSecret: VerifierUnSecret): AuthentifierUnClientApi =>
  async ({ clientApiId, secret, portees, maintenant = new Date() }) => {
    const id = ClientApiId.safe(clientApiId)
    const ligne =
      id === null
        ? null
        : await prismaClient.apiClient.findUnique({
            where: { id },
            select: { ...clientApiSelect, secretHash: true },
          })

    if (ligne === null || !verifierLeSecret(secret, ligne.secretHash))
      return 'NonAuthentifie'

    return issueDAuthentification(versClientApi(ligne), portees, maintenant)
  }
