import { writeFile } from 'node:fs/promises'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import type { AuditStructuresOverviewJob } from './auditStructuresOverviewJob'

const escapeCsvField = (value: string) =>
  value.includes(';') || value.includes('"') || value.includes('\n')
    ? `"${value.replace(/"/g, '""')}"`
    : value

const pct = (count: number, total: number) =>
  total === 0 ? '0%' : `${((count / total) * 100).toFixed(1)}%`

export const executeAuditStructuresOverview = async (
  _job: AuditStructuresOverviewJob,
) => {
  output.log('audit-structures-overview: starting...')

  // ── Comptages globaux ──

  const total = await prismaClient.structure.count({
    where: { suppression: null },
  })

  const totalSupprimees = await prismaClient.structure.count({
    where: { suppression: { not: null } },
  })

  output.log(`\n=== STRUCTURES - VUE D'ENSEMBLE ===`)
  output.log(`Total actives: ${total}`)
  output.log(`Total supprimées (soft delete): ${totalSupprimees}`)

  // ── SIRET ──

  const avecSiret = await prismaClient.structure.count({
    where: { suppression: null, siret: { not: null } },
  })

  const sansSiret = total - avecSiret

  const siretsDupliques = await prismaClient.structure.groupBy({
    by: ['siret'],
    where: { suppression: null, siret: { not: null } },
    _count: { id: true },
    having: { id: { _count: { gt: 1 } } },
  })

  const structuresAvecSiretDuplique = siretsDupliques.reduce(
    (sum, g) => sum + g._count.id,
    0,
  )

  output.log(`\n--- SIRET ---`)
  output.log(`Avec SIRET: ${avecSiret} (${pct(avecSiret, total)})`)
  output.log(`Sans SIRET: ${sansSiret} (${pct(sansSiret, total)})`)
  output.log(
    `SIRETs en doublon: ${siretsDupliques.length} SIRETs → ${structuresAvecSiretDuplique} structures`,
  )

  // ── Coordonnées ──

  const avecCoordonnees = await prismaClient.structure.count({
    where: {
      suppression: null,
      latitude: { not: null },
      longitude: { not: null },
    },
  })

  const sansCoordonnees = total - avecCoordonnees

  output.log(`\n--- GÉOLOCALISATION ---`)
  output.log(
    `Avec coordonnées: ${avecCoordonnees} (${pct(avecCoordonnees, total)})`,
  )
  output.log(
    `Sans coordonnées: ${sansCoordonnees} (${pct(sansCoordonnees, total)})`,
  )

  // ── Code INSEE / BAN ID ──

  const avecCodeInsee = await prismaClient.structure.count({
    where: { suppression: null, codeInsee: { not: null } },
  })

  const avecBanId = await prismaClient.structure.count({
    where: { suppression: null, banId: { not: null } },
  })

  output.log(`Avec code INSEE: ${avecCodeInsee} (${pct(avecCodeInsee, total)})`)
  output.log(`Avec BAN ID: ${avecBanId} (${pct(avecBanId, total)})`)

  // ── Cartographie nationale ──

  const visibleCarto = await prismaClient.structure.count({
    where: { suppression: null, visiblePourCartographieNationale: true },
  })

  const avecCartoId = await prismaClient.structure.count({
    where: {
      suppression: null,
      structureCartographieNationaleId: { not: null },
    },
  })

  output.log(`\n--- CARTOGRAPHIE NATIONALE ---`)
  output.log(
    `Visibles pour carto: ${visibleCarto} (${pct(visibleCarto, total)})`,
  )
  output.log(
    `Avec ID carto nationale: ${avecCartoId} (${pct(avecCartoId, total)})`,
  )

  // ── Relations : emplois, médiateurs, activités ──

  const sansEmploi = await prismaClient.structure.count({
    where: {
      suppression: null,
      emplois: { none: {} },
    },
  })

  const sansMediateur = await prismaClient.structure.count({
    where: {
      suppression: null,
      mediateursEnActivite: { none: {} },
    },
  })

  const sansActivite = await prismaClient.structure.count({
    where: {
      suppression: null,
      activitesCount: 0,
    },
  })

  const orphelines = await prismaClient.structure.count({
    where: {
      suppression: null,
      emplois: { none: {} },
      mediateursEnActivite: { none: {} },
      activitesCount: 0,
    },
  })

  output.log(`\n--- RELATIONS ---`)
  output.log(`Sans emploi: ${sansEmploi} (${pct(sansEmploi, total)})`)
  output.log(
    `Sans médiateur en activité: ${sansMediateur} (${pct(sansMediateur, total)})`,
  )
  output.log(
    `Sans activité (count=0): ${sansActivite} (${pct(sansActivite, total)})`,
  )
  output.log(
    `Orphelines (aucun emploi, médiateur, ni activité): ${orphelines} (${pct(orphelines, total)})`,
  )

  // ── Origine : v1 importées vs natives ──

  const importeesV1 = await prismaClient.structure.count({
    where: { suppression: null, v1Imported: { not: null } },
  })

  const natives = total - importeesV1

  output.log(`\n--- ORIGINE ---`)
  output.log(`Importées v1: ${importeesV1} (${pct(importeesV1, total)})`)
  output.log(`Créées nativement: ${natives} (${pct(natives, total)})`)

  // ── Distribution par département (top 20) ──

  const parDepartement = await prismaClient.$queryRaw<
    { departement: string; count: bigint }[]
  >`
    SELECT LEFT(code_postal, 2) as departement, COUNT(*)::bigint as count
    FROM structures
    WHERE suppression IS NULL
    GROUP BY LEFT(code_postal, 2)
    ORDER BY count DESC
    LIMIT 20
  `

  output.log(`\n--- TOP 20 DÉPARTEMENTS ---`)
  for (const row of parDepartement) {
    output.log(`  ${row.departement}: ${row.count.toString()} structures`)
  }

  // ── Structures supprimées encore référencées ──

  const supprimeeesAvecEmplois = await prismaClient.structure.count({
    where: {
      suppression: { not: null },
      emplois: { some: {} },
    },
  })

  const supprimeeesAvecActivites = await prismaClient.structure.count({
    where: {
      suppression: { not: null },
      activitesCount: { gt: 0 },
    },
  })

  output.log(`\n--- STRUCTURES SUPPRIMÉES ENCORE RÉFÉRENCÉES ---`)
  output.log(`Supprimées avec emplois: ${supprimeeesAvecEmplois}`)
  output.log(`Supprimées avec activités (count>0): ${supprimeeesAvecActivites}`)

  // ── Export CSV des structures orphelines ──

  const structuresOrphelines = await prismaClient.structure.findMany({
    where: {
      suppression: null,
      emplois: { none: {} },
      mediateursEnActivite: { none: {} },
      activitesCount: 0,
    },
    orderBy: { modification: 'desc' },
  })

  const orphelinesCsvHeader = [
    'id',
    'nom',
    'siret',
    'adresse',
    'commune',
    'code_postal',
    'visible_carto',
    'v1_imported',
    'date_creation',
    'date_modification',
  ].join(';')

  const orphelinesCsvLines = [
    orphelinesCsvHeader,
    ...structuresOrphelines.map((s) =>
      [
        s.id,
        escapeCsvField(s.nom),
        s.siret ?? '',
        escapeCsvField(s.adresse),
        escapeCsvField(s.commune),
        s.codePostal,
        s.visiblePourCartographieNationale ? 'oui' : 'non',
        s.v1Imported ? 'oui' : 'non',
        s.creation.toISOString(),
        s.modification.toISOString(),
      ].join(';'),
    ),
  ]

  const orphelinesFilePath = getAuditOutputPath(
    'audit-structures-orphelines.csv',
  )
  await writeFile(orphelinesFilePath, orphelinesCsvLines.join('\n'), 'utf-8')

  output.log(
    `\nExport: ${structuresOrphelines.length} structures orphelines → ${orphelinesFilePath}`,
  )

  // ── Résumé ──

  const summary = {
    total,
    totalSupprimees,
    siret: {
      avecSiret,
      sansSiret,
      siretsDupliques: siretsDupliques.length,
      structuresAvecSiretDuplique,
    },
    geolocalisation: {
      avecCoordonnees,
      sansCoordonnees,
      avecCodeInsee,
      avecBanId,
    },
    cartographie: {
      visibleCarto,
      avecCartoId,
    },
    relations: {
      sansEmploi,
      sansMediateur,
      sansActivite,
      orphelines,
    },
    origine: {
      importeesV1,
      natives,
    },
    supprimees: {
      avecEmplois: supprimeeesAvecEmplois,
      avecActivites: supprimeeesAvecActivites,
    },
    exports: {
      orphelinesFilePath,
    },
  }

  output.log(`\naudit-structures-overview: terminé`)

  return summary
}
