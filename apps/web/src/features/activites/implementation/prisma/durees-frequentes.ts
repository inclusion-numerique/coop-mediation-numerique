import { prismaClient } from '@app/web/prismaClient'
import type { MediateurId } from '../../domain'

export const dureesFrequentesDuMediateur = async (
  mediateurId: MediateurId,
): Promise<readonly number[]> =>
  (
    await prismaClient.$queryRaw<{ duree: number }[]>`
      SELECT duree
      FROM "activites"
      WHERE mediateur_id = ${mediateurId}::UUID
      GROUP BY duree
      HAVING count(*) > 5
      ORDER BY count(*) DESC
      LIMIT 10`
  ).map(({ duree }) => duree)
