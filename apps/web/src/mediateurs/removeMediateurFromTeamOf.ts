import { prismaClient } from '../prismaClient'

export const removeMediateurFromTeamOf =
  ({ id: coordinateurId }: { id: string }) =>
  async (mediateurId: string) => {
    await prismaClient.mediateurCoordonne.updateMany({
      where: { mediateurId, coordinateurId, suppression: null },
      data: { suppression: new Date() },
    })
  }
