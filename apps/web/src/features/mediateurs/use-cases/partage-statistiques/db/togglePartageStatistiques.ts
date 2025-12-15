import { prismaClient } from '@app/web/prismaClient'

export const togglePartageStatistiques = async (mediateurId: string) =>
  prismaClient.$transaction(async (tx) => {
    const existing = await tx.partageStatistiques.findUnique({
      where: { mediateurId },
    })

    if (existing) {
      await tx.partageStatistiques.delete({
        where: { mediateurId },
      })
      return { active: false }
    } else {
      await tx.partageStatistiques.create({
        data: { mediateurId },
      })
      return { active: true }
    }
  })
