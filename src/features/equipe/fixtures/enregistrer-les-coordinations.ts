import type { Prisma } from '@/generated/prisma/client'
import { enSerie } from '@/libraries/fixtures/en-serie'
import { mergeUuids } from '@/libraries/fixtures/merge-uuids'

export type Coordination = {
  coordinateurId: string
  mediateurIds: string[]
}

export const enregistrerLesCoordinations =
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
