import { Prisma } from '@prisma/client'

type Transaction = Prisma.TransactionClient

/**
 * Une table où la fusion peut avoir créé des doublons : de quoi les reconnaître
 * — les deux colonnes qui, ensemble, ne devraient désigner qu'une ligne — et la
 * colonne qui dit qu'elle court encore.
 *
 * Les identifiants sont interpolés en SQL brut, ce que Prisma ne sait pas
 * paramétrer : ils viennent donc de constantes de ce module, jamais d'une
 * saisie.
 */
type TableADedoublonner = {
  readonly table: string
  readonly partition: readonly [string, string]
  readonly fin: string
}

const RATTACHEMENTS: TableADedoublonner = {
  table: 'mediateurs_en_activite',
  partition: ['mediateur_id', 'structure_id'],
  fin: 'fin_activite',
}

const EMPLOIS: TableADedoublonner = {
  table: 'employes_structures',
  partition: ['user_id', 'structure_id'],
  fin: 'fin_emploi',
}

/** Les lignes en trop, le plus ancien de chaque groupe faisant foi. */
const idsEnDouble = async (
  transaction: Transaction,
  { table, partition, fin }: TableADedoublonner,
): Promise<string[]> => {
  const lignes = await transaction.$queryRaw<{ id: string }[]>`
    WITH ranked AS (
      SELECT
        id,
        ROW_NUMBER() OVER (
          PARTITION BY ${Prisma.raw(partition.join(', '))}
          ORDER BY creation ASC
        ) AS rn
      FROM ${Prisma.raw(table)}
      WHERE suppression IS NULL AND ${Prisma.raw(fin)} IS NULL
    )
    SELECT id FROM ranked WHERE rn > 1
  `

  return lignes.map(({ id }) => id)
}

/**
 * Un même médiateur peut se retrouver rattaché deux fois au même lieu quand les
 * deux lieux qu'il fréquentait fusionnent. Le rattachement le plus ancien fait
 * foi ; les suivants disparaissent. Idem côté emplois.
 */
export const dedoublonnerLesRattachements = async (
  transaction: Transaction,
): Promise<number> => {
  const doublons = await idsEnDouble(transaction, RATTACHEMENTS)

  if (doublons.length === 0) return 0

  await transaction.mediateurEnActivite.deleteMany({
    where: { id: { in: doublons } },
  })

  return doublons.length
}

export const dedoublonnerLesEmplois = async (
  transaction: Transaction,
): Promise<number> => {
  const doublons = await idsEnDouble(transaction, EMPLOIS)

  if (doublons.length === 0) return 0

  await transaction.employeStructure.deleteMany({
    where: { id: { in: doublons } },
  })

  return doublons.length
}
