import { prismaClient } from '@/configuration/prisma'
import type { ClientApiExiste } from '@/features/clients-api/domain'

export const clientApiExiste: ClientApiExiste = async (id) =>
  (await prismaClient.apiClient.count({ where: { id } })) > 0
