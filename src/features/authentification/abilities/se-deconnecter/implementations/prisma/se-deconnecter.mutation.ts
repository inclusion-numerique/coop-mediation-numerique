import { prismaClient } from '@/configuration/prisma/prisma-client'

export const supprimerSession = async (sessionToken: string): Promise<void> => {
  await prismaClient.session.delete({ where: { sessionToken } })
}
