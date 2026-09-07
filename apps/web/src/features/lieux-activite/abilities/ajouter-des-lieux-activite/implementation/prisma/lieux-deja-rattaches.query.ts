import { prismaClient } from '@app/web/prismaClient'
import { IdentifiantCartographie } from '../../../../domain/ids-cartographie-nationale'
import { LieuId } from '../../../../domain/lieu-id'
import type { LireLieuxDejaRattaches } from '../../domain'

/** Les lieux où le médiateur exerce encore, réduits à leurs deux identités. */
export const lireLieuxDejaRattaches: LireLieuxDejaRattaches = async (
  mediateurId,
) => {
  const activites = await prismaClient.mediateurEnActivite.findMany({
    where: { mediateurId, suppression: null, fin: null },
    select: {
      lieuInclusion: {
        select: { id: true, structureCartographieNationaleId: true },
      },
    },
  })

  return activites.map(
    ({ lieuInclusion: { id, structureCartographieNationaleId } }) => ({
      id: LieuId(id),
      structureCartographieNationaleId:
        structureCartographieNationaleId == null
          ? null
          : IdentifiantCartographie.safe(structureCartographieNationaleId),
    }),
  )
}
