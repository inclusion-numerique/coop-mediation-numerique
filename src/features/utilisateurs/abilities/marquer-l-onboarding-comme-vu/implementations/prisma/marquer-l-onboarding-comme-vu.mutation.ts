import { prismaClient } from '@/configuration/prisma/prisma-client'

export const marquerLOnboardingCommeVu = async ({
  utilisateurId,
  maintenant,
}: {
  readonly utilisateurId: string
  readonly maintenant: Date
}): Promise<void> => {
  await prismaClient.user.updateMany({
    where: { id: utilisateurId, hasSeenOnboarding: null },
    data: { hasSeenOnboarding: maintenant },
  })
}
