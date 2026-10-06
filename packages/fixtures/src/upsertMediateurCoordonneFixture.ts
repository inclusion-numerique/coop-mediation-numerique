import { enSerie } from '@app/fixtures/enSerie'
import type { Prisma } from '@app/web/generated/prisma/client'

export type MediateurCoordonneFixture = {
  id: string
  coordinateurId: string
  mediateurId: string
  suppression?: Date | null
}

export const upsertMediateurCoordonneFixtures =
  (transaction: Prisma.TransactionClient) =>
  async (coordinations: MediateurCoordonneFixture[]) => {
    await enSerie(
      coordinations,
      ({ id, coordinateurId, mediateurId, suppression }) =>
        transaction.mediateurCoordonne.upsert({
          where: { id },
          create: {
            id,
            coordinateurId,
            mediateurId,
            suppression,
          },
          update: {
            suppression,
          },
        }),
    )
  }
