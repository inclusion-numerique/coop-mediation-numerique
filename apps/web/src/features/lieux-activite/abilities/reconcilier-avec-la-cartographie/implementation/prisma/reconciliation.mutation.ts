import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'
import type {
  AppliquerLaReconciliation,
  LieuCarto,
  LieuxCoopReunis,
  Reconciliation,
} from '../../domain'
import { identifiantEnColonne, modificationExterne } from '../../domain'
import { champsHerites } from './champs-herites'
import {
  dedoublonnerLesEmplois,
  dedoublonnerLesRattachements,
} from './doublons'

type Transaction = Prisma.TransactionClient

/**
 * Ce que la cartographie apprend au lieu qui survit : sous quel identifiant
 * elle le connaît, et la trace de cette écriture venue du dehors — celle-ci
 * seulement si la fiche vient d'une autre source et l'a touchée après nous.
 */
const annotationDe = (lieu: LieuCarto, derniereModificationCoop: Date) => ({
  ...modificationExterne(lieu, derniereModificationCoop),
  structureCartographieNationaleId: identifiantEnColonne(lieu),
})

type Annotation = ReturnType<typeof annotationDe>

/** Tout ce qui pointait un lieu absorbé pointe désormais le survivant. */
const reporterLesRattachements = async (
  transaction: Transaction,
  { survivant, absorbes }: { survivant: string; absorbes: readonly string[] },
) => {
  const cible = { in: [...absorbes] }

  await Promise.all([
    transaction.employeStructure.updateMany({
      where: { structureId: cible },
      data: { structureId: survivant },
    }),
    transaction.mediateurEnActivite.updateMany({
      where: { structureId: cible },
      data: { structureId: survivant },
    }),
    transaction.activite.updateMany({
      where: { structureId: cible },
      data: { structureId: survivant },
    }),
    transaction.activite.updateMany({
      where: { structureEmployeuseId: cible },
      data: { structureEmployeuseId: survivant },
    }),
  ])
}

/** Le lieu que la cartographie ne réunit avec aucun autre : rien à absorber. */
const annoterLeLieu = async (
  transaction: Transaction,
  survivant: string,
  annotation: Annotation,
) => {
  await transaction.lieuInclusion.update({
    where: { id: survivant },
    data: annotation,
  })
}

/**
 * Les lieux que la cartographie tient pour un seul : le survivant reprend ce
 * que les autres portaient — champs hérités, rattachements, activités — et eux
 * disparaissent.
 */
const fusionnerLesLieux = async (
  transaction: Transaction,
  { survivant, absorbes }: { survivant: string; absorbes: readonly string[] },
  annotation: Annotation,
) => {
  const herites = await champsHerites(transaction, [survivant, ...absorbes])
  const activites = await transaction.lieuInclusion.aggregate({
    _sum: { activitesCount: true },
    where: { id: { in: [...absorbes] } },
  })

  await reporterLesRattachements(transaction, { survivant, absorbes })

  await transaction.lieuInclusion.update({
    where: { id: survivant },
    data: {
      ...herites,
      ...annotation,
      activitesCount: { increment: activites._sum.activitesCount ?? 0 },
    },
  })

  await transaction.lieuInclusion.deleteMany({
    where: { id: { in: [...absorbes] } },
  })
}

/** Rend `false` quand il n'y a personne à relier — le lieu a été supprimé. */
const relier = async (
  transaction: Transaction,
  { identifiantCartographie, coopIds, ...lieu }: LieuxCoopReunis,
): Promise<boolean> => {
  const [survivant, ...absorbes] = coopIds
  const existant = await transaction.lieuInclusion.findUnique({
    where: { id: survivant },
    select: { modification: true },
  })

  // La cartographie peut citer un lieu que la coop a supprimé depuis.
  if (existant == null) return false

  const annotation = annotationDe(
    { ...lieu, identifiantCartographie },
    existant.modification,
  )

  await (absorbes.length === 0
    ? annoterLeLieu(transaction, survivant, annotation)
    : fusionnerLesLieux(transaction, { survivant, absorbes }, annotation))

  return true
}

const lierChacun = async (
  transaction: Transaction,
  reunis: readonly LieuxCoopReunis[],
): Promise<number> =>
  reunis.reduce<Promise<number>>(
    async (precedents, lieu) =>
      (await precedents) + ((await relier(transaction, lieu)) ? 1 : 0),
    Promise.resolve(0),
  )

/** Ne rien dire : le test d'intégration n'a que faire du déroulé. */
const silence = (_message: string): void => undefined

/**
 * Le journal est reçu plutôt qu'importé : la progression d'un traitement d'une
 * demi-heure intéresse la ligne de commande qui le déclenche, pas la feature.
 */
export const appliquerLaReconciliation =
  (journal: (message: string) => void = silence): AppliquerLaReconciliation =>
  async (reunis): Promise<Reconciliation> =>
    prismaClient.$transaction(
      async (transaction) => {
        journal('Réinitialisation des liens vers la cartographie')
        const { count: liensReinitialises } =
          await transaction.lieuInclusion.updateMany({
            data: { structureCartographieNationaleId: null },
          })

        journal(`Liaison de ${reunis.length} lieux de la cartographie`)
        const lieuxRelies = await lierChacun(transaction, reunis)

        journal('Suppression des rattachements et emplois en doublon')
        const rattachementsDedoublonnes =
          await dedoublonnerLesRattachements(transaction)
        const emploisDedoublonnes = await dedoublonnerLesEmplois(transaction)

        return {
          liensReinitialises,
          lieuxRelies,
          rattachementsDedoublonnes,
          emploisDedoublonnes,
        }
      },
      { maxWait: 10_000, timeout: 30 * 60 * 1000 },
    )
