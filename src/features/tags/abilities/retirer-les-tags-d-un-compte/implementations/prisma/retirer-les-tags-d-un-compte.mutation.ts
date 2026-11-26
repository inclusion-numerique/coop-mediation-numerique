import { prismaClient } from '@/configuration/prisma'
import type { Prisma } from '@/generated/prisma/client'
import type { AppliquerLeRetraitDesTags } from '../../domain/ports'
import type { CopieDeTag } from '../../domain/retrait-des-tags'

type Transaction = Prisma.TransactionClient

type Deplacement = {
  readonly depuis: string
  readonly mediateurId: string
  readonly vers: string
}

const deplacerLesLiens = async (
  transaction: Transaction,
  { depuis, mediateurId, vers }: Deplacement,
): Promise<void> => {
  const liens = await transaction.activitesTags.findMany({
    where: { tagId: depuis, activite: { mediateurId } },
    select: { activiteId: true },
  })

  await transaction.activitesTags.createMany({
    data: liens.map(({ activiteId }) => ({ activiteId, tagId: vers })),
    skipDuplicates: true,
  })

  await transaction.activitesTags.deleteMany({
    where: {
      tagId: depuis,
      activiteId: { in: liens.map(({ activiteId }) => activiteId) },
    },
  })
}

const deplacer = (
  transaction: Transaction,
  deplacements: readonly Deplacement[],
): Promise<void> =>
  deplacements.reduce<Promise<void>>(async (precedents, deplacement) => {
    await precedents
    await deplacerLesLiens(transaction, deplacement)
  }, Promise.resolve())

const creerLaCopie = async (
  transaction: Transaction,
  { mediateurId, nom, description, departement, depuis }: CopieDeTag,
): Promise<void> => {
  const { id } = await transaction.tag.create({
    data: { nom, description, departement, mediateurId },
    select: { id: true },
  })

  await deplacer(
    transaction,
    depuis.map((tagId) => ({ depuis: tagId, mediateurId, vers: id })),
  )
}

export const appliquerLeRetraitDesTags: AppliquerLeRetraitDesTags = async ({
  supprimeLe,
  supprimes,
  copies,
  reprises,
}) => {
  await prismaClient.$transaction(async (transaction) => {
    await copies.reduce<Promise<void>>(async (precedentes, copie) => {
      await precedentes
      await creerLaCopie(transaction, copie)
    }, Promise.resolve())

    await deplacer(transaction, reprises)

    await transaction.tag.updateMany({
      where: { id: { in: [...supprimes] }, suppression: null },
      data: { suppression: supprimeLe, modification: supprimeLe },
    })
  })
}
