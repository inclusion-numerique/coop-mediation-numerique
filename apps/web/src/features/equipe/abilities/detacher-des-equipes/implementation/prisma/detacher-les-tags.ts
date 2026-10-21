import type { Prisma } from '@app/web/generated/prisma/client'
import {
  type CoordinateurId,
  essaimageDesTagsDuCoordinateur,
  type MediateurId,
} from '../../../../domain'
import { mediateursUtilisateurs, moveTagLinks } from './activites-tags'
import { ensureTag, type TagTemplate } from './ensure-tag'

type Transaction = Prisma.TransactionClient

const softDeleteTags = async (
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

const essaimer = async (
  transaction: Transaction,
  tag: TagTemplate,
  destinataires: readonly MediateurId[],
): Promise<number> => {
  await destinataires.reduce<Promise<void>>(async (precedents, mediateurId) => {
    await precedents

    const versTagId = await ensureTag(transaction, mediateurId, tag)

    await moveTagLinks(transaction, {
      depuisTagId: tag.id,
      versTagId,
      mediateurId,
    })
  }, Promise.resolve())

  return destinataires.length
}

export const detacherLesTagsDuCoordinateur = async (
  transaction: Transaction,
  coordinateurId: CoordinateurId,
  maintenant: Date,
): Promise<{ transferes: number; supprimes: number }> => {
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
    supprimes: await softDeleteTags(
      transaction,
      { coordinateurId },
      maintenant,
    ),
  }
}

export const detacherLesTagsDuMediateur = async (
  transaction: Transaction,
  mediateurId: MediateurId,
  maintenant: Date,
): Promise<{ transferes: number; supprimes: number }> => ({
  transferes: 0,
  supprimes: await softDeleteTags(transaction, { mediateurId }, maintenant),
})
