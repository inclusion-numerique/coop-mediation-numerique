import { prismaClient } from '@/configuration/prisma'
import {
  avecIdentifiantCarto,
  inscriptionPourLIdentifiantCarto,
} from '../../../../implementations/prisma/registre'

export const activitesEnCoursDeLUtilisateur = async (userId: string) => {
  const activites = await prismaClient.mediateurEnActivite.findMany({
    where: { mediateur: { userId }, suppression: null, fin: null },
    select: {
      id: true,
      lieuInclusion: {
        select: {
          id: true,
          inscriptionRegistre: inscriptionPourLIdentifiantCarto,
        },
      },
    },
  })

  return activites.map(({ id, lieuInclusion }) => ({
    id,
    lieuInclusion: avecIdentifiantCarto(lieuInclusion),
  }))
}
