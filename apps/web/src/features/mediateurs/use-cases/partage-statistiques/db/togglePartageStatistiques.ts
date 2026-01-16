import { CoordinateurUser, MediateurUser } from '@app/web/auth/userTypeGuards'
import { prismaClient } from '@app/web/prismaClient'

export const togglePartageStatistiques = async ({
  mediateur,
  coordinateur,
}: MediateurUser | CoordinateurUser) => {
  if (mediateur?.id != null) {
    return prismaClient.$transaction(async (tx) => {
      const existing = await tx.partageStatistiques.findUnique({
        where: { mediateurId: mediateur.id },
      })

      if (!existing) {
        await tx.partageStatistiques.create({
          data: { mediateurId: mediateur.id },
        })

        return { active: true }
      }

      if (!existing.deleted) {
        await tx.partageStatistiques.update({
          where: { mediateurId: mediateur.id },
          data: { deleted: new Date() },
        })

        return { active: false }
      }

      await tx.partageStatistiques.update({
        where: { mediateurId: mediateur.id },
        data: { deleted: null },
      })

      return { active: true }
    })
  }

  if (coordinateur?.id != null) {
    return prismaClient.$transaction(async (tx) => {
      const existing = await tx.partageStatistiques.findUnique({
        where: { coordinateurId: coordinateur.id },
      })

      if (!existing) {
        await tx.partageStatistiques.create({
          data: { coordinateurId: coordinateur.id },
        })

        return { active: true }
      }

      if (!existing.deleted) {
        await tx.partageStatistiques.update({
          where: { coordinateurId: coordinateur.id },
          data: { deleted: new Date() },
        })

        return { active: false }
      }

      await tx.partageStatistiques.update({
        where: { coordinateurId: coordinateur.id },
        data: { deleted: null },
      })

      return { active: true }
    })
  }
}
