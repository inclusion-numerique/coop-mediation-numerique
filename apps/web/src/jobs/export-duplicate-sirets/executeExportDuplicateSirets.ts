import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { ExportDuplicateSiretsJob } from './exportDuplicateSiretsJob'

const csvHeader = [
  'siret',
  'id',
  'nom',
  'adresse',
  'commune',
  'code_postal',
  'telephone',
  'visible_carto',
  'activites_count',
  'emplois_count',
  'mediateurs_count',
  'date_modification',
].join(';')

const escapeCsvField = (value: string) =>
  value.includes(';') || value.includes('"') || value.includes('\n')
    ? `"${value.replace(/"/g, '""')}"`
    : value

export const executeExportDuplicateSirets = async (
  _job: ExportDuplicateSiretsJob,
) => {
  output.log('export-duplicate-sirets: searching for duplicate SIRETs...')

  const duplicateSirets = await prismaClient.structure.groupBy({
    by: ['siret'],
    where: {
      suppression: null,
      siret: { not: null },
    },
    _count: { id: true },
    having: {
      id: { _count: { gt: 1 } },
    },
  })

  output.log(
    `export-duplicate-sirets: found ${duplicateSirets.length} SIRETs with duplicates`,
  )

  if (duplicateSirets.length === 0) {
    return { siretCount: 0, structureCount: 0, filePath: null }
  }

  const sirets = duplicateSirets.map((g) => g.siret as string)

  const structures = await prismaClient.structure.findMany({
    where: {
      suppression: null,
      siret: { in: sirets },
    },
    include: {
      _count: {
        select: {
          emplois: true,
          mediateursEnActivite: true,
        },
      },
    },
    orderBy: [{ siret: 'asc' }, { modification: 'desc' }],
  })

  const csvLines = [
    csvHeader,
    ...structures.map((s) =>
      [
        s.siret ?? '',
        s.id,
        escapeCsvField(s.nom),
        escapeCsvField(s.adresse),
        escapeCsvField(s.commune),
        s.codePostal,
        s.telephone ?? '',
        s.visiblePourCartographieNationale ? 'oui' : 'non',
        s.activitesCount,
        s._count.emplois,
        s._count.mediateursEnActivite,
        s.modification.toISOString(),
      ].join(';'),
    ),
  ]

  const filePath = join(process.cwd(), 'duplicate-sirets.csv')
  await writeFile(filePath, csvLines.join('\n'), 'utf-8')

  output.log(
    `export-duplicate-sirets: exported ${structures.length} structures to ${filePath}`,
  )

  return {
    siretCount: duplicateSirets.length,
    structureCount: structures.length,
    filePath,
  }
}
