import { prismaClient } from '@/configuration/prisma'
import { IdentifiantCartographie } from '../../../../domain/cartographie-nationale/ids-cartographie-nationale'
import { LieuId } from '../../../../domain/identifiants/lieu-id'
import { RattachementId } from '../../../../domain/identifiants/rattachement-id'
import {
  avecIdentifiantCarto,
  inscriptionPourLIdentifiantCarto,
} from '../../../../implementations/prisma/registre/identifiants-carto.query'

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

  return activites.map(({ id, lieuInclusion }) => {
    const { structureCartographieNationaleId } =
      avecIdentifiantCarto(lieuInclusion)

    return {
      id: RattachementId(id),
      lieuInclusion: {
        id: LieuId(lieuInclusion.id),
        structureCartographieNationaleId:
          structureCartographieNationaleId === null
            ? null
            : IdentifiantCartographie.safe(structureCartographieNationaleId),
      },
    }
  })
}
