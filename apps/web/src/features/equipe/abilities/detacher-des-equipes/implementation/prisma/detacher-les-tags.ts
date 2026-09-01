import type { Prisma } from '@prisma/client'
import {
  type CoordinateurId,
  essaimageDesTagsDuCoordinateur,
  type MediateurId,
} from '../../../../domain'
import { mediateursUtilisateurs, moveTagLinks } from './activites-tags'
import { ensureTag, type TagTemplate } from './ensure-tag'

type Transaction = Prisma.TransactionClient

/**
 * Le sort des tags d'un compte qui quitte ses équipes.
 *
 * Les règles — qui hérite, chez qui un tag essaime — vivent dans `domain/`. Ce
 * fichier lit les faits qu'elles réclament, puis exécute ce qu'elles décident.
 */

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

  // L'original s'en va dans les deux cas — essaimer, c'est recopier puis retirer.
  return {
    transferes,
    supprimes: await softDeleteTags(
      transaction,
      { coordinateurId },
      maintenant,
    ),
  }
}

/**
 * Les tags d'un médiateur lui sont propres : ils partent avec lui, qu'il ait un
 * coordinateur ou non. Les liens vers les comptes rendus subsistent, si bien que
 * l'historique reste lisible.
 */
export const detacherLesTagsDuMediateur = async (
  transaction: Transaction,
  mediateurId: MediateurId,
  maintenant: Date,
): Promise<{ transferes: number; supprimes: number }> => ({
  transferes: 0,
  supprimes: await softDeleteTags(transaction, { mediateurId }, maintenant),
})
