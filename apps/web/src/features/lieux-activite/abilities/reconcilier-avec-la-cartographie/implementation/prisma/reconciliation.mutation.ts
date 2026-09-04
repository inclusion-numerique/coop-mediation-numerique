import { prismaClient } from '@app/web/prismaClient'
import type { Prisma } from '@prisma/client'
import type {
  AppliquerLaReconciliation,
  LieuxCoopReunis,
  Reconciliation,
} from '../../domain'
import { modificationExterne } from '../../domain'

type Transaction = Prisma.TransactionClient

/**
 * Ce qu'un lieu absorbé lègue à celui qui survit : sa visibilité, son référent
 * et ses identifiants v1. La visibilité se propage dès qu'un seul des fusionnés
 * était publié — dépublier un lieu par le seul effet d'une fusion le ferait
 * disparaître de la carte sans que personne ne l'ait décidé.
 */
const heritage = {
  visiblePourCartographieNationale: true,
  nomReferent: true,
  courrielReferent: true,
  telephoneReferent: true,
  v1Imported: true,
  v1StructureId: true,
  v1StructureIdPg: true,
  v1PermanenceId: true,
} satisfies Prisma.LieuInclusionSelect

type Heritage = Prisma.LieuInclusionGetPayload<{ select: typeof heritage }>

const plusRecentNonVide = <Champ extends keyof Heritage>(
  lieux: readonly Heritage[],
  champ: Champ,
): Heritage[Champ] | null =>
  lieux.find((lieu) => lieu[champ] != null)?.[champ] ?? null

const champsHerites = async (
  transaction: Transaction,
  ids: readonly string[],
): Promise<Heritage> => {
  // Du plus récemment modifié au plus ancien : le premier à renseigner un champ
  // le lègue.
  const lieux = await transaction.lieuInclusion.findMany({
    where: { id: { in: [...ids] } },
    select: heritage,
    orderBy: { modification: 'desc' },
  })

  return {
    visiblePourCartographieNationale: lieux.some(
      ({ visiblePourCartographieNationale }) =>
        visiblePourCartographieNationale,
    ),
    nomReferent: plusRecentNonVide(lieux, 'nomReferent'),
    courrielReferent: plusRecentNonVide(lieux, 'courrielReferent'),
    telephoneReferent: plusRecentNonVide(lieux, 'telephoneReferent'),
    v1Imported: plusRecentNonVide(lieux, 'v1Imported'),
    v1StructureId: plusRecentNonVide(lieux, 'v1StructureId'),
    v1StructureIdPg: plusRecentNonVide(lieux, 'v1StructureIdPg'),
    v1PermanenceId: plusRecentNonVide(lieux, 'v1PermanenceId'),
  }
}

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

const relier = async (
  transaction: Transaction,
  { identifiantCartographie, coopIds, ...lieu }: LieuxCoopReunis,
) => {
  const [survivant, ...absorbes] = coopIds
  const existant = await transaction.lieuInclusion.findUnique({
    where: { id: survivant },
    select: { modification: true },
  })

  // La cartographie peut citer un lieu que la coop a supprimé depuis.
  if (existant == null) return false

  const trace = modificationExterne(
    { ...lieu, identifiantCartographie },
    existant.modification,
  )

  if (absorbes.length === 0) {
    await transaction.lieuInclusion.update({
      where: { id: survivant },
      data: {
        ...trace,
        structureCartographieNationaleId: identifiantCartographie,
      },
    })

    return true
  }

  const herites = await champsHerites(transaction, coopIds)
  const activites = await transaction.lieuInclusion.aggregate({
    _sum: { activitesCount: true },
    where: { id: { in: [...absorbes] } },
  })

  await reporterLesRattachements(transaction, { survivant, absorbes })

  await transaction.lieuInclusion.update({
    where: { id: survivant },
    data: {
      ...herites,
      ...trace,
      activitesCount: { increment: activites._sum.activitesCount ?? 0 },
      structureCartographieNationaleId: identifiantCartographie,
    },
  })

  await transaction.lieuInclusion.deleteMany({
    where: { id: { in: [...absorbes] } },
  })

  return true
}

/**
 * Un même médiateur peut se retrouver rattaché deux fois au même lieu quand les
 * deux lieux qu'il fréquentait fusionnent. Le rattachement le plus ancien fait
 * foi ; les suivants disparaissent. Idem côté emplois.
 */
const dedoublonnerLesRattachements = async (
  transaction: Transaction,
): Promise<number> => {
  const doublons = await transaction.$queryRaw<{ id: string }[]>`
    WITH ranked AS (
      SELECT
        id,
        ROW_NUMBER() OVER (
          PARTITION BY mediateur_id, structure_id
          ORDER BY creation ASC
        ) AS rn
      FROM mediateurs_en_activite
      WHERE suppression IS NULL AND fin_activite IS NULL
    )
    SELECT id FROM ranked WHERE rn > 1
  `

  if (doublons.length === 0) return 0

  await transaction.mediateurEnActivite.deleteMany({
    where: { id: { in: doublons.map(({ id }) => id) } },
  })

  return doublons.length
}

const dedoublonnerLesEmplois = async (
  transaction: Transaction,
): Promise<number> => {
  const doublons = await transaction.$queryRaw<{ id: string }[]>`
    WITH ranked AS (
      SELECT
        id,
        ROW_NUMBER() OVER (
          PARTITION BY user_id, structure_id
          ORDER BY creation ASC
        ) AS rn
      FROM employes_structures
      WHERE suppression IS NULL AND fin_emploi IS NULL
    )
    SELECT id FROM ranked WHERE rn > 1
  `

  if (doublons.length === 0) return 0

  await transaction.employeStructure.deleteMany({
    where: { id: { in: doublons.map(({ id }) => id) } },
  })

  return doublons.length
}

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
        const relies = await reunis.reduce<Promise<number>>(
          async (precedents, lieu) =>
            (await precedents) + ((await relier(transaction, lieu)) ? 1 : 0),
          Promise.resolve(0),
        )

        journal('Suppression des rattachements et emplois en doublon')
        const rattachementsDedoublonnes =
          await dedoublonnerLesRattachements(transaction)
        const emploisDedoublonnes = await dedoublonnerLesEmplois(transaction)

        return {
          liensReinitialises,
          lieuxRelies: relies,
          rattachementsDedoublonnes,
          emploisDedoublonnes,
        }
      },
      { maxWait: 10_000, timeout: 30 * 60 * 1000 },
    )
