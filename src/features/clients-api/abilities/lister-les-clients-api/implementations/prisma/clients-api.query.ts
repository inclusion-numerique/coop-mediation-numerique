import { prismaClient } from '@/configuration/prisma'
import type { ClientApi } from '@/features/clients-api/domain'
import {
  clientApiSelect,
  versClientApi,
} from '@/features/clients-api/implementations/prisma/client-api.transfer'

export const listerLesClientsApi = async (): Promise<readonly ClientApi[]> => {
  const lignes = await prismaClient.apiClient.findMany({
    select: clientApiSelect,
    orderBy: { created: 'desc' },
  })
  return lignes.map(versClientApi)
}
