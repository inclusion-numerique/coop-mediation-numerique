import { prismaClient } from '@/configuration/prisma'
import type { EnregistrerLeSecret } from '../../domain/renouveler-le-secret'

export const enregistrerLeSecret: EnregistrerLeSecret = async ({
  id,
  secretHash,
}) => {
  await prismaClient.apiClient.update({
    where: { id },
    data: { secretHash, updated: new Date() },
  })
}
