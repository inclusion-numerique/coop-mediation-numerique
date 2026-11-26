import { prismaClient } from '@/configuration/prisma'
import type { Prisma } from '@/generated/prisma/client'
import type { AppliquerLeRetraitDesTags } from '../../domain/ports'
import type {
  CopieDeTag,
  RepriseDeTag,
  RetraitDesTags,
} from '../../domain/retrait-des-tags'

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

const supprimerLesTagsActifs = async (
  transaction: Transaction,
  { supprimeLe, supprimes }: RetraitDesTags,
): Promise<ReadonlySet<string>> =>
  new Set(
    (
      await transaction.tag.updateManyAndReturn({
        where: { id: { in: [...supprimes] }, suppression: null },
        data: { suppression: supprimeLe, modification: supprimeLe },
        select: { id: true },
      })
    ).map(({ id }) => id),
  )

const ciblesActives = async (
  transaction: Transaction,
  reprises: readonly RepriseDeTag[],
): Promise<ReadonlySet<string>> =>
  new Set(
    (
      await transaction.tag.findMany({
        where: {
          id: { in: reprises.map(({ vers }) => vers) },
          suppression: null,
        },
        select: { id: true },
      })
    ).map(({ id }) => id),
  )

const copiesDesTagsSupprimes = (
  copies: readonly CopieDeTag[],
  supprimes: ReadonlySet<string>,
): readonly CopieDeTag[] =>
  copies
    .map((copie) => ({
      ...copie,
      depuis: copie.depuis.filter((tagId) => supprimes.has(tagId)),
    }))
    .filter(({ depuis }) => depuis.length > 0)

export const appliquerLeRetraitDesTags: AppliquerLeRetraitDesTags = async (
  retrait,
) =>
  prismaClient.$transaction(async (transaction) => {
    const supprimes = await supprimerLesTagsActifs(transaction, retrait)
    const cibles = await ciblesActives(transaction, retrait.reprises)

    const copies = copiesDesTagsSupprimes(retrait.copies, supprimes)
    const reprises = retrait.reprises.filter(
      ({ depuis, vers }) => supprimes.has(depuis) && cibles.has(vers),
    )

    await copies.reduce<Promise<void>>(async (precedentes, copie) => {
      await precedentes
      await creerLaCopie(transaction, copie)
    }, Promise.resolve())

    await deplacer(transaction, reprises)

    return {
      supprimes: retrait.supprimes.filter((tagId) => supprimes.has(tagId)),
      copies,
      reprises,
    }
  })
