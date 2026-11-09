import type { Prisma } from '@app/web/generated/prisma/client'
import { prismaClient } from '@app/web/prismaClient'
import {
  CoordinateurId,
  MediateurId,
  NomDuTag,
  TagId,
} from '../../../../domain'
import {
  essaimageDesTagsDuCoordinateur,
  type TagDetenu,
  tagDAccueil,
} from '../../domain'

type Transaction = Prisma.TransactionClient

type TagModele = {
  readonly id: string
  readonly nom: string
  readonly description: string | null
  readonly departement: string | null
}

export type TagsRetires = {
  readonly transferes: number
  readonly supprimes: number
}

const AUCUN: TagsRetires = { transferes: 0, supprimes: 0 }

const marquerSupprimes = async (
  transaction: Transaction,
  where: Prisma.TagWhereInput,
  maintenant: Date,
): Promise<number> => {
  const { count } = await transaction.tag.updateMany({
    where: { ...where, suppression: null },
    data: { suppression: maintenant, modification: maintenant },
  })

  return count
}

const mediateursUtilisateurs = async (
  transaction: Transaction,
  tagId: string,
): Promise<readonly MediateurId[]> =>
  (
    await transaction.activitesTags.findMany({
      where: { tagId },
      select: { activite: { select: { mediateurId: true } } },
    })
  ).map(({ activite }) => MediateurId(activite.mediateurId))

const tagsDetenus = (
  lignes: readonly { id: string; nom: string }[],
): readonly TagDetenu[] =>
  lignes.flatMap(({ id, nom }) => {
    const nomDuTag = NomDuTag.safe(nom)
    return nomDuTag === null ? [] : [{ id: TagId(id), nom: nomDuTag }]
  })

const tagDuMediateur = async (
  transaction: Transaction,
  mediateurId: MediateurId,
  modele: TagModele,
): Promise<string> => {
  const detenus = await transaction.tag.findMany({
    where: { mediateurId, suppression: null },
    select: { id: true, nom: true },
  })
  const nom = NomDuTag.safe(modele.nom)
  const existant = nom === null ? null : tagDAccueil(tagsDetenus(detenus), nom)

  if (existant !== null) return existant

  const { id } = await transaction.tag.create({
    data: {
      nom: modele.nom,
      description: modele.description,
      departement: modele.departement,
      mediateurId,
    },
    select: { id: true },
  })

  return id
}

const deplacerLesLiens = async (
  transaction: Transaction,
  {
    depuisTagId,
    versTagId,
    mediateurId,
  }: {
    readonly depuisTagId: string
    readonly versTagId: string
    readonly mediateurId: MediateurId
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

const essaimer = async (
  transaction: Transaction,
  modele: TagModele,
  destinataires: readonly MediateurId[],
): Promise<number> => {
  await destinataires.reduce<Promise<void>>(async (precedents, mediateurId) => {
    await precedents

    await deplacerLesLiens(transaction, {
      depuisTagId: modele.id,
      versTagId: await tagDuMediateur(transaction, mediateurId, modele),
      mediateurId,
    })
  }, Promise.resolve())

  return destinataires.length
}

const retirerLesTagsDuCoordinateur = async (
  transaction: Transaction,
  coordinateurId: CoordinateurId,
  maintenant: Date,
): Promise<TagsRetires> => {
  const tags = await transaction.tag.findMany({
    where: { coordinateurId, suppression: null },
    select: { id: true, nom: true, description: true, departement: true },
  })

  const transferes = await tags.reduce<Promise<number>>(
    async (precedent, tag) => {
      const total = await precedent
      const essaimage = essaimageDesTagsDuCoordinateur(
        await mediateursUtilisateurs(transaction, tag.id),
      )

      return essaimage._tag === 'supprime'
        ? total
        : total + (await essaimer(transaction, tag, essaimage.vers))
    },
    Promise.resolve(0),
  )

  return {
    transferes,
    supprimes: await marquerSupprimes(
      transaction,
      { coordinateurId },
      maintenant,
    ),
  }
}

const retirerLesTagsDuMediateur = async (
  transaction: Transaction,
  mediateurId: MediateurId,
  maintenant: Date,
): Promise<TagsRetires> => ({
  transferes: 0,
  supprimes: await marquerSupprimes(transaction, { mediateurId }, maintenant),
})

export const retirerLesTagsDUnCompte = ({
  mediateurId,
  coordinateurId,
  maintenant = new Date(),
}: {
  readonly mediateurId: string | null
  readonly coordinateurId: string | null
  readonly maintenant?: Date
}): Promise<TagsRetires> =>
  prismaClient.$transaction(async (transaction) => {
    const duMediateur =
      mediateurId === null
        ? AUCUN
        : await retirerLesTagsDuMediateur(
            transaction,
            MediateurId(mediateurId),
            maintenant,
          )

    const duCoordinateur =
      coordinateurId === null
        ? AUCUN
        : await retirerLesTagsDuCoordinateur(
            transaction,
            CoordinateurId(coordinateurId),
            maintenant,
          )

    return {
      transferes: duMediateur.transferes + duCoordinateur.transferes,
      supprimes: duMediateur.supprimes + duCoordinateur.supprimes,
    }
  })
