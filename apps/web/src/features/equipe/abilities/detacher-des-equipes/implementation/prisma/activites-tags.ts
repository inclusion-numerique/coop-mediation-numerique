import type { Prisma } from '@app/web/generated/prisma/client'
import { MediateurId } from '../../../../domain'

type Transaction = Prisma.TransactionClient

export const mediateursUtilisateurs = async (
  transaction: Transaction,
  tagId: string,
): Promise<readonly MediateurId[]> => {
  const liens = await transaction.activitesTags.findMany({
    where: { tagId },
    select: { activite: { select: { mediateurId: true } } },
  })

  return liens.map(({ activite }) => MediateurId(activite.mediateurId))
}

export const moveTagLinks = async (
  transaction: Transaction,
  {
    depuisTagId,
    versTagId,
    mediateurId,
  }: {
    readonly depuisTagId: string
    readonly versTagId: string
    readonly mediateurId: string
  },
): Promise<void> => {
  const liens = await transaction.activitesTags.findMany({
    where: { tagId: depuisTagId, activite: { mediateurId } },
    select: { activiteId: true },
  })

  await transaction.activitesTags.createMany({
    data: liens.map(({ activiteId }) => ({ activiteId, tagId: versTagId })),
    skipDuplicates: true,
  })

  await transaction.activitesTags.deleteMany({
    where: {
      tagId: depuisTagId,
      activiteId: { in: liens.map(({ activiteId }) => activiteId) },
    },
  })
}
