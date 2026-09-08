import { prismaClient } from '@app/web/prismaClient'
import { IdentifiantCartographie } from '../../../../domain/ids-cartographie-nationale'
import { LieuId } from '../../../../domain/lieu-id'
import {
  avecIdentifiantCarto,
  inscriptionPourLIdentifiantCarto,
} from '../../../../implementation/prisma/registre'
import type { LireLieuxDejaRattaches } from '../../domain'

/** Les lieux où le médiateur exerce encore, réduits à leurs deux identités. */
export const lireLieuxDejaRattaches: LireLieuxDejaRattaches = async (
  mediateurId,
) => {
  const activites = await prismaClient.mediateurEnActivite.findMany({
    where: { mediateurId, suppression: null, fin: null },
    select: {
      lieuInclusion: {
        select: {
          id: true,
          inscriptionRegistre: inscriptionPourLIdentifiantCarto,
        },
      },
    },
  })

  // L'identité cartographique vient du registre, non d'une copie tenue par la
  // coop : c'est sur elle que la sonde écarte un lieu déjà rattaché.
  const lieux = activites.map(({ lieuInclusion }) =>
    avecIdentifiantCarto(lieuInclusion),
  )

  return lieux.map(({ id, structureCartographieNationaleId }) => ({
    id: LieuId(id),
    structureCartographieNationaleId:
      structureCartographieNationaleId == null
        ? null
        : IdentifiantCartographie.safe(structureCartographieNationaleId),
  }))
}
