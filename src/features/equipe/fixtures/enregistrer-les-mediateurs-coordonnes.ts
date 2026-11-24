import type { Prisma } from '@/generated/prisma/client'
import { enSerie } from '@/libraries/fixtures/en-serie'

export type MediateurCoordonneFixture = {
  id: string
  coordinateurId: string
  mediateurId: string
  suppression?: Date | null
}

export const enregistrerLesMediateursCoordonnes =
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
            ...(suppression === undefined ? {} : { suppression }),
          },
          update: {
            ...(suppression === undefined ? {} : { suppression }),
          },
        }),
    )
  }
