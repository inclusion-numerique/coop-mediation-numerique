import type { Prisma } from '@app/web/generated/prisma/client'
import { enSerie } from '@app/web/libraries/fixtures/enSerie'
import { mergeUuids } from '@app/web/libraries/fixtures/mergeUuids'

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
