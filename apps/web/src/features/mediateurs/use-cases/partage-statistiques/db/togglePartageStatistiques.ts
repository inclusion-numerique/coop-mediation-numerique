import { prismaClient } from '@app/web/prismaClient'

export const togglePartageStatistiques = async (mediateurId: string) =>
  prismaClient.$transaction(async (tx) => {
    const existing = await tx.partageStatistiques.findUnique({
      where: { mediateurId },
    })

    if (!existing) {
      await tx.partageStatistiques.create({
        data: { mediateurId },
      })

      return { active: true }
    }

    if (!existing.deleted) {
      await tx.partageStatistiques.update({
        where: { mediateurId },
        data: { deleted: new Date() },
      })

      return { active: false }
    }

    await tx.partageStatistiques.update({
      where: { mediateurId },
      data: { deleted: null },
    })

    return { active: true }
  })
