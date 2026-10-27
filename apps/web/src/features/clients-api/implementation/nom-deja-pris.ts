import type { NomDuClientApi } from '@app/web/features/clients-api/domain'
import { prismaClient } from '@app/web/prismaClient'

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
