import { prismaClient } from '@/configuration/prisma/prisma-client'
import type { NomDuClientApi } from '@/features/clients-api/domain'

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
