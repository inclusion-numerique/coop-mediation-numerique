import { addMutationLog, prismaClient } from '@/configuration/prisma'
import type { UtilisateurId } from '@/features/utilisateurs/domain'

export const ouvrirLUsurpation = async ({
  jetonDeSession,
  cibleId,
  usurpateurId,
  duree,
}: {
  readonly jetonDeSession: string
  readonly cibleId: UtilisateurId
  readonly usurpateurId: string
  readonly duree: () => number
}): Promise<void> => {
  await prismaClient.$transaction([
    prismaClient.session.deleteMany({ where: { usurperId: usurpateurId } }),
    prismaClient.session.update({
      where: { sessionToken: jetonDeSession },
      data: { userId: cibleId, usurperId: usurpateurId },
    }),
  ])

  addMutationLog({
    userId: usurpateurId,
    nom: 'UsurperUtilisateur',
    duration: duree(),
    data: { initialUserId: usurpateurId, userId: cibleId },
  })
}
