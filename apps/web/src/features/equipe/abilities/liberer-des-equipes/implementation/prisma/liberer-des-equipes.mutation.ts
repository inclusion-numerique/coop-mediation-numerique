import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'

type Transaction = Prisma.TransactionClient

type Bilan = {
  readonly invitationsSupprimees: number
  readonly appartenancesSupprimees: number
  readonly tagsTransferes: number
  readonly tagsSupprimes: number
}

/**
 * Les médiateurs qui se sont servis d'un tag dans leurs comptes rendus.
 * C'est cette liste qui décide à qui le tag doit revenir.
 */
const mediateursUtilisateurs = async (
  transaction: Transaction,
  tagId: string,
): Promise<readonly string[]> => {
  const liens = await transaction.activitesTags.findMany({
    where: { tagId },
    select: { activite: { select: { mediateurId: true } } },
  })

  return [...new Set(liens.map(({ activite }) => activite.mediateurId))]
}

/**
 * Le tag du médiateur qui doit porter les comptes rendus repris.
 *
 * On réutilise un tag de même nom quand il en a déjà un — sur toute la base, six
 * couples sont dans ce cas, mais créer un doublon lui laisserait deux entrées
 * identiques dans sa liste, sans moyen de les distinguer.
 */
const tagDAccueil = async (
  transaction: Transaction,
  mediateurId: string,
  modele: {
    nom: string
    description: string | null
    departement: string | null
  },
): Promise<string> => {
  const existant = await transaction.tag.findFirst({
    where: {
      mediateurId,
      suppression: null,
      nom: { equals: modele.nom, mode: 'insensitive' },
    },
    select: { id: true },
  })

  if (existant !== null) return existant.id

  const cree = await transaction.tag.create({
    data: {
      nom: modele.nom,
      description: modele.description,
      departement: modele.departement,
      mediateurId,
    },
    select: { id: true },
  })

  return cree.id
}

/**
 * Repointe vers `versTagId` les comptes rendus d'un médiateur qui portaient
 * `depuisTagId`.
 *
 * La table de liaison a une clé primaire composite : on ne met pas à jour son
 * `tagId`, on crée le nouveau couple puis on retire l'ancien. `skipDuplicates`
 * couvre le cas où le médiateur avait déjà posé les deux tags sur la même
 * activité.
 */
const repointerComptesRendus = async (
  transaction: Transaction,
  {
    depuisTagId,
    versTagId,
    mediateurId,
  }: {
    depuisTagId: string
    versTagId: string
    mediateurId: string
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
      activiteId: { in: liens.map((l) => l.activiteId) },
    },
  })
}

/**
 * Les tags d'un coordinateur qui s'en va ESSAIMENT vers chacun des médiateurs
 * qui s'en servaient.
 *
 * Un tag est un vocabulaire de travail : le supprimer priverait de sens des
 * comptes rendus qui ne sont pas ceux du partant. On le duplique donc chez
 * chaque utilisateur réel — un tag utilisé par quatre médiateurs devient quatre
 * tags — puis l'original est marqué supprimé.
 *
 * Un tag que personne n'a utilisé n'essaime nulle part : il est simplement
 * supprimé.
 */
const essaimerTagsDuCoordinateur = async (
  transaction: Transaction,
  coordinateurId: string,
  maintenant: Date,
): Promise<{ transferes: number; supprimes: number }> => {
  const tags = await transaction.tag.findMany({
    where: { coordinateurId, suppression: null },
    select: { id: true, nom: true, description: true, departement: true },
  })

  const essaimages = await tags.reduce<Promise<number>>(
    async (precedent, tag) => {
      const total = await precedent
      const mediateurIds = await mediateursUtilisateurs(transaction, tag.id)

      const crees = await mediateurIds.reduce<Promise<number>>(
        async (precedents, mediateurId) => {
          const cumul = await precedents
          const versTagId = await tagDAccueil(transaction, mediateurId, tag)
          await repointerComptesRendus(transaction, {
            depuisTagId: tag.id,
            versTagId,
            mediateurId,
          })
          return cumul + 1
        },
        Promise.resolve(0),
      )

      return total + crees
    },
    Promise.resolve(0),
  )

  const { count } = await transaction.tag.updateMany({
    where: { coordinateurId, suppression: null },
    data: { suppression: maintenant, modification: maintenant },
  })

  return { transferes: essaimages, supprimes: count }
}

/**
 * Les tags d'un médiateur qui s'en va reviennent à son coordinateur, quand il
 * n'y en a qu'un — sinon il n'y a personne à qui les donner sans arbitrer, et
 * ils sont marqués supprimés. L'historique reste lisible : les liens vers les
 * comptes rendus ne sont pas rompus.
 */
const transfererTagsDuMediateur = async (
  transaction: Transaction,
  mediateurId: string,
  maintenant: Date,
): Promise<{ transferes: number; supprimes: number }> => {
  const coordinations = await transaction.mediateurCoordonne.findMany({
    where: { mediateurId, suppression: null },
    select: { coordinateurId: true },
  })

  const destinataires = [
    ...new Set(coordinations.map(({ coordinateurId }) => coordinateurId)),
  ]

  if (destinataires.length !== 1) {
    const { count } = await transaction.tag.updateMany({
      where: { mediateurId, suppression: null },
      data: { suppression: maintenant, modification: maintenant },
    })
    return { transferes: 0, supprimes: count }
  }

  const { count } = await transaction.tag.updateMany({
    where: { mediateurId, suppression: null },
    data: {
      mediateurId: null,
      coordinateurId: destinataires[0],
      modification: maintenant,
    },
  })

  return { transferes: count, supprimes: 0 }
}

/**
 * Détache un compte de tout ce qui l'attache à une équipe.
 *
 * Un seul port, et non trois, parce que l'ORDRE compte : les tags d'un médiateur
 * ne peuvent revenir à son coordinateur qu'avant que le lien de coordination ne
 * soit coupé. C'est un invariant qu'un appelant extérieur ne saurait pas tenir,
 * donc il vit ici.
 *
 * Idempotent : chaque écriture est filtrée sur ce qui est encore vivant.
 */
export const libererDesEquipes = ({
  mediateurId,
  coordinateurId,
  maintenant = new Date(),
}: {
  readonly mediateurId: string | null
  readonly coordinateurId: string | null
  readonly maintenant?: Date
}): Promise<Bilan> =>
  prismaClient.$transaction(async (transaction) => {
    const tagsMediateur =
      mediateurId === null
        ? { transferes: 0, supprimes: 0 }
        : await transfererTagsDuMediateur(transaction, mediateurId, maintenant)

    const tagsCoordinateur =
      coordinateurId === null
        ? { transferes: 0, supprimes: 0 }
        : await essaimerTagsDuCoordinateur(
            transaction,
            coordinateurId,
            maintenant,
          )

    const proprietaires = [
      ...(mediateurId === null ? [] : [{ mediateurId }]),
      ...(coordinateurId === null ? [] : [{ coordinateurId }]),
    ]

    const invitations =
      proprietaires.length === 0
        ? { count: 0 }
        : await transaction.invitationEquipe.deleteMany({
            where: { OR: proprietaires },
          })

    const appartenances =
      proprietaires.length === 0
        ? { count: 0 }
        : await transaction.mediateurCoordonne.deleteMany({
            where: { OR: proprietaires },
          })

    return {
      invitationsSupprimees: invitations.count,
      appartenancesSupprimees: appartenances.count,
      tagsTransferes: tagsMediateur.transferes + tagsCoordinateur.transferes,
      tagsSupprimes: tagsMediateur.supprimes + tagsCoordinateur.supprimes,
    }
  })
