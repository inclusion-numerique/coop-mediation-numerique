import { enSerie } from '@app/fixtures/enSerie'
import type { Prisma } from '@prisma/client'
import { mergeUuids } from './mergeUuids'

export type Coordination = {
  coordinateurId: string
  mediateurIds: string[]
}

export const upsertCoordinationFixtures =
  (transaction: Prisma.TransactionClient) =>
  async (coordinations: Coordination[]) => {
    await enSerie(coordinations, async ({ coordinateurId, mediateurIds }) =>
      enSerie(mediateurIds, (mediateurId) => {
        const id = mergeUuids(coordinateurId, mediateurId)

        return transaction.mediateurCoordonne.upsert({
          where: { id },
          create: { id, coordinateurId, mediateurId },
          update: { id, coordinateurId, mediateurId },
        })
      }),
    )
  }
