import { prismaClient } from '@/configuration/prisma'
import { type UtilisateurId } from '@/features/utilisateurs/domain'
import type { RetirerDuRegistre } from '@/features/utilisateurs/implementations/prisma/registre-des-personnes.mutation'
import {
  type EchecTechnique,
  enEchecTechnique,
  failure,
  type Result,
  success,
} from '@/libraries/result'

export const effacerLInscription =
  (retirerDuRegistre: RetirerDuRegistre) =>
  async (
    utilisateurId: UtilisateurId,
  ): Promise<Result<void, EchecTechnique>> => {
    try {
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
        await retirerDuRegistre(tx, utilisateurId)
        await tx.user.delete({ where: { id: utilisateurId } })
      })
      return success(undefined)
    } catch (erreur) {
      return failure(enEchecTechnique(erreur))
    }
  }
