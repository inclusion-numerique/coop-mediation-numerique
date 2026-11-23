import { prismaClient } from '@/configuration/prisma/prismaClient'
import {
  clientApiSelect,
  versClientApi,
} from '@/features/clients-api/db/client-api.transfer'
import type { ClientApi } from '@/features/clients-api/domain'

export const listerLesClientsApi = async (): Promise<readonly ClientApi[]> => {
  const lignes = await prismaClient.apiClient.findMany({
    select: clientApiSelect,
    orderBy: { created: 'desc' },
  })
  return lignes.map(versClientApi)
}
