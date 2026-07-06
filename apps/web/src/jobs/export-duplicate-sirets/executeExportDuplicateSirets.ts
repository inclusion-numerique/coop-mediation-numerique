import { writeFile } from 'node:fs/promises'
import { fetchSiretApiData } from '@app/web/features/structures/siret/fetchSiretData'
import { getSiretBearingStructures } from '@app/web/features/structures/siret/siretBearingStructures'
import {
  buildAddressFromApiData,
  diceSimilarity,
  parseSireneIdentity,
  throttleApiEntreprise,
} from '@app/web/features/structures/siret/siretIdentity'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { output } from '@app/web/jobs/output'
import type { ExportDuplicateSiretsJob } from './exportDuplicateSiretsJob'

const csvHeader = [
  'siret',
  'source',
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
  'nom_api',
  'adresse_api',
  'correlation_nom',
  'correlation_adresse',
].join(';')

const escapeCsvField = (value: string) =>
  value.includes(';') || value.includes('"') || value.includes('\n')
    ? `"${value.replace(/"/g, '""')}"`
    : value

const optional = (value: number | null): string =>
  value === null ? '' : String(value)

export const executeExportDuplicateSirets = async (
  _job: ExportDuplicateSiretsJob,
) => {
  output.log(
    'export-duplicate-sirets: searching for duplicate SIRETs (lieux + employeuses)...',
  )

  // Vue unifiée des deux tables : un SIRET partagé par >1 structure (quelle que soit
  // la table) est un doublon — y compris lieu↔employeuse ou employeuse↔employeuse.
  const structures = await getSiretBearingStructures()

  const countBySiret = structures.reduce<Map<string, number>>(
    (accumulator, structure) => {
      accumulator.set(
        structure.siret,
        (accumulator.get(structure.siret) ?? 0) + 1,
      )
      return accumulator
    },
    new Map(),
  )

  const duplicateSirets = [...countBySiret.entries()]
    .filter(([, count]) => count > 1)
    .map(([siret]) => siret)

  output.log(
    `export-duplicate-sirets: found ${duplicateSirets.length} SIRETs with duplicates`,
  )

  if (duplicateSirets.length === 0) {
    return { siretCount: 0, structureCount: 0, filePath: null }
  }

  const duplicateSiretSet = new Set(duplicateSirets)
  const rows = structures
    .filter((structure) => duplicateSiretSet.has(structure.siret))
    .sort(
      (a, b) =>
        a.siret.localeCompare(b.siret) ||
        b.modification.getTime() - a.modification.getTime(),
    )

  // Une passe API Entreprise par SIRET unique (mise en cache pour tous ses doublons).
  output.log(
    `export-duplicate-sirets: fetching API Entreprise for ${duplicateSirets.length} SIRETs (throttled)...`,
  )
  const apiDataBySiret = new Map<string, { nom: string; adresse: string }>()
  for (const [index, siret] of duplicateSirets.entries()) {
    if ((index + 1) % 50 === 0) {
      output.log(
        `export-duplicate-sirets: API progress ${index + 1}/${duplicateSirets.length}`,
      )
    }
    try {
      const result = await fetchSiretApiData(siret)
      await throttleApiEntreprise()
      const parsed = 'error' in result ? null : parseSireneIdentity(result)
      apiDataBySiret.set(
        siret,
        parsed && 'identity' in parsed
          ? { nom: parsed.identity.nom, adresse: parsed.identity.adresse }
          : { nom: '', adresse: '' },
      )
    } catch {
      apiDataBySiret.set(siret, { nom: '', adresse: '' })
    }
  }

  const emptyLine = new Array(17).fill('').join(';')
  const csvLines: string[] = [csvHeader]

  const previousSiretRef: { value: string | null } = { value: null }
  for (const structure of rows) {
    if (
      previousSiretRef.value !== null &&
      structure.siret !== previousSiretRef.value
    ) {
      csvLines.push(emptyLine)
    }
    const apiData = apiDataBySiret.get(structure.siret) ?? {
      nom: '',
      adresse: '',
    }
    const corrNom = apiData.nom ? diceSimilarity(structure.nom, apiData.nom) : 0
    const corrAdresse = apiData.adresse
      ? diceSimilarity(structure.adresse, apiData.adresse)
      : 0
    csvLines.push(
      [
        structure.siret,
        structure.source,
        structure.id,
        escapeCsvField(structure.nom),
        escapeCsvField(structure.adresse),
        escapeCsvField(structure.commune),
        structure.codePostal,
        structure.telephone ?? '',
        structure.visibleCarto === null
          ? ''
          : structure.visibleCarto
            ? 'oui'
            : 'non',
        optional(structure.activitesCount),
        structure.emploisCount,
        optional(structure.mediateursCount),
        structure.modification.toISOString(),
        escapeCsvField(apiData.nom),
        escapeCsvField(apiData.adresse),
        `${Math.round(corrNom * 100)}%`,
        `${Math.round(corrAdresse * 100)}%`,
      ].join(';'),
    )
    previousSiretRef.value = structure.siret
  }

  const filePath = getAuditOutputPath('duplicate-sirets.csv')
  await writeFile(filePath, csvLines.join('\n'), 'utf-8')

  output.log(
    `export-duplicate-sirets: exported ${rows.length} structures to ${filePath}`,
  )

  return {
    siretCount: duplicateSirets.length,
    structureCount: rows.length,
    filePath,
  }
}
