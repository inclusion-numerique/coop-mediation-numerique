import { prismaClient } from '@/configuration/prisma'
import {
  clientApiSelect,
  versClientApi,
} from '@/features/clients-api/implementations/prisma/client-api.transfer'
import type { LireLeClientApi } from '../../domain/consulter-un-client-api'

export const lireLeClientApi: LireLeClientApi = async (id) => {
  const ligne = await prismaClient.apiClient.findUnique({
    where: { id },
    select: clientApiSelect,
  })

  return ligne === null ? null : versClientApi(ligne)
}
