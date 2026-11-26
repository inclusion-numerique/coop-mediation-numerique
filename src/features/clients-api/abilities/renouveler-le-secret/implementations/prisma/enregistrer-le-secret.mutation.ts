import { prismaClient } from '@/configuration/prisma'
import type { EnregistrerLeSecret } from '../../domain/ports'

export const enregistrerLeSecret: EnregistrerLeSecret = async ({
  id,
  secretHash,
  maintenant,
}) => {
  await prismaClient.apiClient.update({
    where: { id },
    data: { secretHash, updated: maintenant },
  })
}
