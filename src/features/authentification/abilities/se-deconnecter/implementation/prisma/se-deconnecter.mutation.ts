import { prismaClient } from '@/configuration/prisma/prismaClient'

export const supprimerSession = async (sessionToken: string): Promise<void> => {
  await prismaClient.session.delete({ where: { sessionToken } })
}
