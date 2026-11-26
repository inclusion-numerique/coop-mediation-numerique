import { prismaClient } from '@/configuration/prisma'
import type { EnregistrerLeSecret } from '../../domain/ports'

export const enregistrerLeSecret: EnregistrerLeSecret = async ({
  id,
  secretHash,
}) => {
  await prismaClient.apiClient.update({
    where: { id },
    data: { secretHash, updated: new Date() },
  })
}
