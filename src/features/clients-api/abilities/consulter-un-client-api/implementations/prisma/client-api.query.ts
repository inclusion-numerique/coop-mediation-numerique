import { prismaClient } from '@/configuration/prisma'
import {
  clientApiSelect,
  versClientApi,
} from '@/features/clients-api/implementations/prisma/client-api.transfer'
import type { LireLeClientApi } from '../../domain/ports'

export const lireLeClientApi: LireLeClientApi = async (id) => {
  const ligne = await prismaClient.apiClient.findUnique({
    where: { id },
    select: clientApiSelect,
  })

  return ligne === null ? null : versClientApi(ligne)
}
