import type { Prisma } from '@prisma/client'
import { MediateurId } from '../../../../domain'

type Transaction = Prisma.TransactionClient

/**
 * La table de liaison entre comptes rendus et tags.
 *
 * Elle est regroupée ici parce qu'elle a une particularité qu'on ne veut pas
 * voir se perdre au milieu d'autre chose : sa clé primaire est composite, donc
 * un tag ne se « change » pas sur un lien, il se remplace.
 */

/** Les médiateurs qui se sont servis d'un tag dans leurs comptes rendus. */
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

/**
 * Repointe vers `versTagId` les comptes rendus d'un médiateur qui portaient
 * `depuisTagId`.
 *
 * La clé primaire étant composite, on ne met pas à jour le `tagId` : on crée le
 * nouveau couple puis on retire l'ancien. `skipDuplicates` couvre le cas où le
 * médiateur avait déjà posé les deux tags sur la même activité.
 */
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
