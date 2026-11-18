import type { NomDuClientApi } from '@/features/clients-api/domain'
import { prismaClient } from '@/prismaClient'

export const nomDejaPris = async (
  nom: NomDuClientApi,
  saufClientApiId?: string,
): Promise<boolean> =>
  (await prismaClient.apiClient.count({
    where: {
      name: nom,
      ...(saufClientApiId === undefined
        ? {}
        : { id: { not: saufClientApiId } }),
    },
  })) > 0
