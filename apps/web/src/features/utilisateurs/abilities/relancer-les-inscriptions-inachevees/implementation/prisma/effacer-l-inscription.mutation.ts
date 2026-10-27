import type { UtilisateurId } from '@app/web/features/utilisateurs/domain'
import { prismaClient } from '@app/web/prismaClient'

export const effacerLInscription = async (
  utilisateurId: UtilisateurId,
): Promise<void> => {
  await prismaClient.$transaction(async (tx) => {
    const compte = await tx.user.findUniqueOrThrow({
      where: { id: utilisateurId },
      select: {
        mediateur: { select: { id: true } },
        coordinateur: { select: { id: true } },
      },
    })

    if (compte.mediateur !== null) {
      const mediateurId = compte.mediateur.id
      await tx.mediateurCoordonne.deleteMany({ where: { mediateurId } })
      await tx.mediateurEnActivite.deleteMany({ where: { mediateurId } })
      await tx.invitationEquipe.deleteMany({ where: { mediateurId } })
      await tx.partageStatistiques.deleteMany({ where: { mediateurId } })
      await tx.tag.deleteMany({ where: { mediateurId } })
      await tx.mediateur.delete({ where: { id: mediateurId } })
    }

    if (compte.coordinateur !== null) {
      const coordinateurId = compte.coordinateur.id
      await tx.mediateurCoordonne.deleteMany({ where: { coordinateurId } })
      await tx.invitationEquipe.deleteMany({ where: { coordinateurId } })
      await tx.partageStatistiques.deleteMany({ where: { coordinateurId } })
      await tx.tag.deleteMany({ where: { coordinateurId } })
      await tx.coordinateur.delete({ where: { id: coordinateurId } })
    }

    await tx.mutation.updateMany({
      where: { userId: utilisateurId },
      data: { userId: null },
    })
    await tx.user.delete({ where: { id: utilisateurId } })
  })
}
