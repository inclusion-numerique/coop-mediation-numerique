import { writeFile } from 'node:fs/promises'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { prismaClient } from '@app/web/prismaClient'
import type { JobExecutor } from '../jobExecutors'
import { output } from '../output'

// Réconciliation du pivot `coop.users` <-> `main.personne` : pose le `coop_id` MANQUANT sur les
// personnes de l'Entrepôt, en les retrouvant par email (ADR-002 périmètre élargi). C'est ce lien qui
// donne accès, côté coop, aux affectations (structures employeuses) et contrats de `main`.
//
// Ne fait que COMPLÉTER : ne touche jamais à un `coop_id` déjà posé (l'Entrepôt en pose l'essentiel),
// ne crée aucune personne (le find-or-create reste réservé à l'inscription, gated sur une employeuse).
//
// Pivot email = les 3 chemins réels du `contact` jsonb (`coop.email`, `idposte.mail_perso`,
// `idposte.mail_pro`), insensible à la casse, avec tie-break préférant la personne portant une
// affectation `idposte` active + structure (cf. features/structures/main/ensurePersonneMain).
//
// Conflits gérés sans planter : une personne ne peut porter qu'UN `coop_id` (contrainte unique). Si
// l'email ne matche que des personnes déjà liées ailleurs, ou si deux users se disputent la même
// personne libre, on ne lie pas et on trace. Écrit dans une base partagée -> dry-run par défaut ;
// chaque run produit un CSV (une ligne par user ciblé) pour relire avant/après application.

type Outcome =
  | 'lie'
  | 'conflit-personne-disputee'
  | 'conflit-personne-deja-liee'
  | 'sans-match'

type AnalyseRow = {
  user_id: string
  email: string
  is_conseiller_numerique: boolean
  outcome: Outcome
  personne_id: number | null
}

// Pour chaque `coop.users` non encore lié, détermine la meilleure personne main à relier (ou le motif
// de non-liaison). `assign` garantit qu'une même personne libre n'est réclamée que par un seul user
// (déterministe : plus petit `user_id`), les autres retombant en `conflit-personne-disputee`.
const analyser = (): Promise<AnalyseRow[]> =>
  prismaClient.$queryRaw<AnalyseRow[]>`
    WITH cible AS (
      SELECT u.id AS user_id, lower(trim(u.email)) AS email, u.is_conseiller_numerique
      FROM coop.users u
      WHERE u.deleted IS NULL
        AND NOT EXISTS (SELECT 1 FROM main.personne p WHERE p.coop_id = u.id)
    ),
    correspondance AS (
      SELECT
        c.user_id,
        p.id AS personne_id,
        (p.coop_id IS NOT NULL) AS deja_liee,
        EXISTS (
          SELECT 1 FROM main.personne_affectations_emploi a
          WHERE a.personne_id = p.id AND a.est_active
            AND a.source = 'idposte' AND a.structure_administrative_id IS NOT NULL
        ) AS aff_idposte
      FROM cible c
      JOIN main.personne p
        ON lower(p.contact->'coop'->>'email') = c.email
        OR lower(p.contact->'idposte'->>'mail_perso') = c.email
        OR lower(p.contact->'idposte'->>'mail_pro') = c.email
    ),
    meilleure_libre AS (
      SELECT DISTINCT ON (user_id) user_id, personne_id
      FROM correspondance
      WHERE NOT deja_liee
      ORDER BY user_id, aff_idposte DESC, personne_id ASC
    ),
    attribution AS (
      SELECT DISTINCT ON (personne_id) user_id, personne_id
      FROM meilleure_libre
      ORDER BY personne_id, user_id
    )
    SELECT
      c.user_id,
      c.email,
      c.is_conseiller_numerique,
      CASE
        WHEN a.user_id IS NOT NULL THEN 'lie'
        WHEN b.user_id IS NOT NULL THEN 'conflit-personne-disputee'
        WHEN EXISTS (SELECT 1 FROM correspondance m WHERE m.user_id = c.user_id)
          THEN 'conflit-personne-deja-liee'
        ELSE 'sans-match'
      END AS outcome,
      a.personne_id
    FROM cible c
    LEFT JOIN meilleure_libre b ON b.user_id = c.user_id
    LEFT JOIN attribution a ON a.user_id = c.user_id
    ORDER BY outcome, c.user_id`

const escapeCsvField = (value: string): string =>
  /[";\n]/.test(value) ? `"${value.replace(/"/g, '""')}"` : value

const csvHeader = [
  'user_id',
  'email',
  'is_conseiller_numerique',
  'outcome',
  'personne_id',
  'applied',
].join(';')

const rowToCsv = (row: AnalyseRow, applied: string): string =>
  [
    row.user_id,
    escapeCsvField(row.email),
    String(row.is_conseiller_numerique),
    row.outcome,
    row.personne_id === null ? '' : String(row.personne_id),
    applied,
  ].join(';')

export const executeRelierPersonnesCoopMain: JobExecutor<
  'relier-personnes-coop-main'
> = async (job) => {
  const dryRun = job.payload?.dryRun ?? true

  const rows = await analyser()

  // Application : on ne lie que si la personne est TOUJOURS libre (garde `coop_id IS NULL` contre une
  // course avec l'Entrepôt entre l'analyse et l'écriture). 0 ligne affectée = déjà liée entre-temps.
  const appliedByUser = new Map<string, 'oui' | 'course'>()
  if (!dryRun) {
    const aLier = rows.filter(
      (row): row is AnalyseRow & { personne_id: number } =>
        row.outcome === 'lie' && row.personne_id !== null,
    )
    await aLier.reduce<Promise<void>>(async (previous, row) => {
      await previous
      const { count } = await prismaClient.personneMain.updateMany({
        where: { id: row.personne_id, coopId: null },
        data: { coopId: row.user_id },
      })
      appliedByUser.set(row.user_id, count === 1 ? 'oui' : 'course')
    }, Promise.resolve())
  }

  const filePath = getAuditOutputPath(
    `relier-personnes-coop-main-${dryRun ? 'dry-run' : 'apply'}.csv`,
  )
  await writeFile(
    filePath,
    [
      csvHeader,
      ...rows.map((row) => rowToCsv(row, appliedByUser.get(row.user_id) ?? '')),
    ].join('\n'),
    'utf-8',
  )

  const count = (predicate: (row: AnalyseRow) => boolean) =>
    rows.filter(predicate).length

  const results = {
    dryRun,
    csv: filePath,
    ciblesNonLiees: rows.length,
    aLier: count((r) => r.outcome === 'lie'),
    aLierCn: count((r) => r.outcome === 'lie' && r.is_conseiller_numerique),
    conflitsPersonneDisputee: count(
      (r) => r.outcome === 'conflit-personne-disputee',
    ),
    conflitsPersonneDejaLiee: count(
      (r) => r.outcome === 'conflit-personne-deja-liee',
    ),
    sansMatch: count((r) => r.outcome === 'sans-match'),
    liesAppliques: [...appliedByUser.values()].filter((v) => v === 'oui')
      .length,
    liesCourse: [...appliedByUser.values()].filter((v) => v === 'course')
      .length,
  }

  output.log(
    `relier-personnes-coop-main: ${dryRun ? 'DRY RUN — ' : ''}${
      results.ciblesNonLiees
    } users non liés ; à lier ${results.aLier} (dont CN ${results.aLierCn}) ; ` +
      `conflits disputée ${results.conflitsPersonneDisputee} / déjà-liée ${results.conflitsPersonneDejaLiee} ; ` +
      `sans match ${results.sansMatch}` +
      (dryRun
        ? ''
        : ` ; appliqués ${results.liesAppliques} (course ${results.liesCourse})`) +
      ` ; CSV ${filePath}`,
  )

  return results
}
