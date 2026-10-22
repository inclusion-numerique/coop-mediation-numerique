import type { UtilisateurId } from '@app/web/features/utilisateurs/domain'
import { prismaClient } from '@app/web/prismaClient'
import { addMutationLog } from '@app/web/utils/addMutationLog'

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
