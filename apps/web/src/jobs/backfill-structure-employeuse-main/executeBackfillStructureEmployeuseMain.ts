import { prismaClient } from '@app/web/prismaClient'
import type { JobExecutor } from '../jobExecutors'
import { output } from '../output'

// Remplit par lots les colonnes int `structure_employeuse_main_id` (activites) et `structure_main_id`
// (employes_structures) à partir de `main.structure_administrative.id`, via la correspondance
// `structure_coop_id` (ADR-002 étape 6, technique colonne + backfill + échange). Chaque lot ne touche
// que des lignes réellement mappables (JOIN sur main) : la boucle se termine forcément. Écrit dans
// une base partagée : dry-run par défaut (compte ce qui reste à remplir, sans écrire).

const resteAActivites = async (): Promise<number> => {
  const [row] = await prismaClient.$queryRaw<{ n: bigint }[]>`
    SELECT count(*) AS n
    FROM coop.activites a
    JOIN main.structure_administrative m ON m.structure_coop_id = a.structure_employeuse_id
    WHERE a.structure_employeuse_main_id IS NULL`
  return Number(row.n)
}

const resteAEmplois = async (): Promise<number> => {
  const [row] = await prismaClient.$queryRaw<{ n: bigint }[]>`
    SELECT count(*) AS n
    FROM coop.employes_structures e
    JOIN main.structure_administrative m ON m.structure_coop_id = e.structure_id
    WHERE e.structure_main_id IS NULL`
  return Number(row.n)
}

const backfillLotActivites = (batchSize: number): Promise<number> =>
  prismaClient.$executeRaw`
    WITH lot AS (
      SELECT a.id AS id, m.id AS main_id
      FROM coop.activites a
      JOIN main.structure_administrative m ON m.structure_coop_id = a.structure_employeuse_id
      WHERE a.structure_employeuse_main_id IS NULL
      LIMIT ${batchSize}
    )
    UPDATE coop.activites a
    SET structure_employeuse_main_id = lot.main_id
    FROM lot
    WHERE a.id = lot.id`

const backfillLotEmplois = (batchSize: number): Promise<number> =>
  prismaClient.$executeRaw`
    WITH lot AS (
      SELECT e.id AS id, m.id AS main_id
      FROM coop.employes_structures e
      JOIN main.structure_administrative m ON m.structure_coop_id = e.structure_id
      WHERE e.structure_main_id IS NULL
      LIMIT ${batchSize}
    )
    UPDATE coop.employes_structures e
    SET structure_main_id = lot.main_id
    FROM lot
    WHERE e.id = lot.id`

// Enchaîne les lots jusqu'à ce qu'un lot ne mette plus rien à jour.
const boucleBackfill = async (
  batchSize: number,
  lot: (batchSize: number) => Promise<number>,
  total = 0,
): Promise<number> => {
  const n = await lot(batchSize)
  return n === 0 ? total : boucleBackfill(batchSize, lot, total + n)
}

export const executeBackfillStructureEmployeuseMain: JobExecutor<
  'backfill-structure-employeuse-main'
> = async (job) => {
  const dryRun = job.payload?.dryRun ?? true
  const batchSize = job.payload?.batchSize ?? 50_000

  const activitesAvant = await resteAActivites()
  const emploisAvant = await resteAEmplois()

  const activitesRemplies = dryRun
    ? 0
    : await boucleBackfill(batchSize, backfillLotActivites)
  const emploisRemplis = dryRun
    ? 0
    : await boucleBackfill(batchSize, backfillLotEmplois)

  const results = {
    dryRun,
    batchSize,
    activites: { restantAvant: activitesAvant, remplies: activitesRemplies },
    emplois: { restantAvant: emploisAvant, remplis: emploisRemplis },
  }

  output.log(
    `backfill-structure-employeuse-main: ${dryRun ? 'DRY RUN — ' : ''}activites à remplir ${
      activitesAvant
    }${dryRun ? '' : ` (remplies ${activitesRemplies})`} ; emplois à remplir ${
      emploisAvant
    }${dryRun ? '' : ` (remplis ${emploisRemplis})`}`,
  )

  return results
}
