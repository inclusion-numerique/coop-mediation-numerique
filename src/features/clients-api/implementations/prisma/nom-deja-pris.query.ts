import { prismaClient } from '@/configuration/prisma'
import type { LeNomEstPris } from '@/features/clients-api/domain'

export const nomDejaPris: LeNomEstPris = async (nom, saufClientApiId) =>
  (await prismaClient.apiClient.count({
    where: {
      name: nom,
      ...(saufClientApiId === undefined
        ? {}
        : { id: { not: saufClientApiId } }),
    },
  })) > 0
