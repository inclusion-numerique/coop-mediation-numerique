import {
  clientApiSelect,
  versClientApi,
} from '@app/web/features/clients-api/db/client-api.transfer'
import type { ClientApi } from '@app/web/features/clients-api/domain'
import { prismaClient } from '@app/web/prismaClient'

export const listerLesClientsApi = async (): Promise<readonly ClientApi[]> => {
  const lignes = await prismaClient.apiClient.findMany({
    select: clientApiSelect,
    orderBy: { created: 'desc' },
  })
  return lignes.map(versClientApi)
}
