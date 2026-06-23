import { writeFile } from 'node:fs/promises'
import { getEmploisCountByCorrelation } from '@app/web/features/structures/correlateStructureAdministrative'
import { fetchSiretApiData } from '@app/web/features/structures/siret/fetchSiretData'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import type { ExportDuplicateSiretsJob } from './exportDuplicateSiretsJob'

// API Entreprise: 250 req/min ≈ 4 req/s → throttle 250ms between calls
const API_ENTREPRISE_THROTTLE_MS = 250
const throttle = () =>
  new Promise((resolve) => setTimeout(resolve, API_ENTREPRISE_THROTTLE_MS))

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
  'nom_api',
  'adresse_api',
  'correlation_nom',
  'correlation_adresse',
].join(';')

const escapeCsvField = (value: string) =>
  value.includes(';') || value.includes('"') || value.includes('\n')
    ? `"${value.replace(/"/g, '""')}"`
    : value

const normalize = (s: string): string =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

const bigrams = (s: string): Map<string, number> => {
  const set = new Map<string, number>()
  for (let i = 0; i < s.length - 1; i++) {
    const bg = s.slice(i, i + 2)
    set.set(bg, (set.get(bg) ?? 0) + 1)
  }
  return set
}

const diceSimilarity = (a: string, b: string): number => {
  const na = normalize(a)
  const nb = normalize(b)
  if (na === nb) return 1
  if (na.length < 2 || nb.length < 2) return 0
  const ba = bigrams(na)
  const bb = bigrams(nb)
  let inter = 0
  for (const [bg, c] of ba) inter += Math.min(c, bb.get(bg) ?? 0)
  return (2 * inter) / (na.length - 1 + nb.length - 1)
}

const buildAdresseFromApi = (
  adresse: {
    numero_voie?: string | null
    indice_repetition_voie?: string | null
    type_voie?: string | null
    libelle_voie?: string | null
  } | null,
): string => {
  if (!adresse) return ''
  return [
    adresse.numero_voie,
    adresse.indice_repetition_voie,
    adresse.type_voie,
    adresse.libelle_voie,
  ]
    .filter((p) => Boolean(p) && p !== 'null')
    .join(' ')
}

export const executeExportDuplicateSirets = async (
  _job: ExportDuplicateSiretsJob,
) => {
  output.log('export-duplicate-sirets: searching for duplicate SIRETs...')

  const duplicateSirets = await prismaClient.structure.groupBy({
    by: ['siret'],
    where: {
      suppression: null,
      siret: { not: null },
      NOT: { siret: '' },
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
          mediateursEnActivite: true,
        },
      },
    },
    orderBy: [{ siret: 'asc' }, { modification: 'desc' }],
  })

  // Emplois employeuse corrélés par nom + code INSEE (plus de lien FK).
  const emploisCountByStructureId = await getEmploisCountByCorrelation(
    structures,
    { activeOnly: false },
  )

  // Fetch API Entreprise data once per SIRET (cached for all duplicates)
  output.log(
    `export-duplicate-sirets: fetching API Entreprise for ${sirets.length} SIRETs (throttled)...`,
  )
  const apiDataBySiret = new Map<string, { nom: string; adresse: string }>()
  for (const [index, siret] of sirets.entries()) {
    if ((index + 1) % 50 === 0) {
      output.log(
        `export-duplicate-sirets: API progress ${index + 1}/${sirets.length}`,
      )
    }
    try {
      const result = await fetchSiretApiData(siret)
      await throttle()
      if (!('error' in result)) {
        const nomApi =
          result.data.unite_legale.personne_morale_attributs?.raison_sociale ??
          ''
        const adresseApi = buildAdresseFromApi(result.data.adresse)
        apiDataBySiret.set(siret, { nom: nomApi, adresse: adresseApi })
      } else {
        apiDataBySiret.set(siret, { nom: '', adresse: '' })
      }
    } catch {
      apiDataBySiret.set(siret, { nom: '', adresse: '' })
    }
  }

  const emptyLine = new Array(16).fill('').join(';')
  const csvLines: string[] = [csvHeader]

  let previousSiret: string | null = null
  for (const s of structures) {
    if (previousSiret !== null && s.siret !== previousSiret) {
      csvLines.push(emptyLine)
    }
    const apiData = (s.siret && apiDataBySiret.get(s.siret)) || {
      nom: '',
      adresse: '',
    }
    const corrNom = apiData.nom ? diceSimilarity(s.nom, apiData.nom) : 0
    const corrAdresse = apiData.adresse
      ? diceSimilarity(s.adresse, apiData.adresse)
      : 0
    csvLines.push(
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
        emploisCountByStructureId.get(s.id) ?? 0,
        s._count.mediateursEnActivite,
        s.modification.toISOString(),
        escapeCsvField(apiData.nom),
        escapeCsvField(apiData.adresse),
        `${Math.round(corrNom * 100)}%`,
        `${Math.round(corrAdresse * 100)}%`,
      ].join(';'),
    )
    previousSiret = s.siret
  }

  const filePath = getAuditOutputPath('duplicate-sirets.csv')
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
