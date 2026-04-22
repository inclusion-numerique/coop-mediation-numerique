import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { banFeatureToAdresseBanData } from '@app/web/external-apis/ban/banFeatureToAdresseBanData'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import { writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import type { AuditAdresseCoherenceJob } from './auditAdresseCoherenceJob'

// Batch de 50 avec 1s de pause, comme dans fix-structures
const BATCH_SIZE = 50
const PAUSE_MS = 1000

const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

type Categorie =
  | 'ok'
  | 'score_faible'
  | 'code_postal_divergent'
  | 'code_insee_divergent'
  | 'commune_divergente'
  | 'ecart_geographique'
  | 'adresse_introuvable'
  | 'sans_coordonnees'
  | 'multi_anomalies'

type AuditRow = {
  id: string
  categorie: Categorie
  anomalies: string
  siret: string
  nomBase: string
  adresseBase: string
  communeBase: string
  codePostalBase: string
  codeInseeBase: string
  banScore: number
  adresseBan: string
  communeBan: string
  codePostalBan: string
  codeInseeBan: string
  latitudeBase: number | null
  longitudeBase: number | null
  latitudeBan: number | null
  longitudeBan: number | null
  distanceMetres: number | null
  visibleCarto: boolean
  activitesCount: number
}

const escapeCsvField = (value: string) =>
  value.includes(';') || value.includes('"') || value.includes('\n')
    ? `"${value.replace(/"/g, '""')}"`
    : value

/**
 * Distance en mètres entre deux points GPS (formule de Haversine).
 */
const haversineDistance = (
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number => {
  const R = 6_371_000
  const toRad = (deg: number) => (deg * Math.PI) / 180
  const dLat = toRad(lat2 - lat1)
  const dLon = toRad(lon2 - lon1)
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
}

const SCORE_THRESHOLD = 0.5
const DISTANCE_THRESHOLD_METRES = 1000

const csvHeader = [
  'id',
  'categorie',
  'anomalies',
  'siret',
  'nom',
  'adresse_base',
  'adresse_ban',
  'commune_base',
  'commune_ban',
  'code_postal_base',
  'code_postal_ban',
  'code_insee_base',
  'code_insee_ban',
  'ban_score',
  'latitude_base',
  'longitude_base',
  'latitude_ban',
  'longitude_ban',
  'distance_metres',
  'visible_carto',
  'activites_count',
].join(';')

const rowToCsv = (row: AuditRow): string =>
  [
    row.id,
    row.categorie,
    escapeCsvField(row.anomalies),
    row.siret,
    escapeCsvField(row.nomBase),
    escapeCsvField(row.adresseBase),
    escapeCsvField(row.adresseBan),
    escapeCsvField(row.communeBase),
    escapeCsvField(row.communeBan),
    row.codePostalBase,
    row.codePostalBan,
    row.codeInseeBase,
    row.codeInseeBan,
    row.banScore.toFixed(3),
    row.latitudeBase?.toFixed(6) ?? '',
    row.longitudeBase?.toFixed(6) ?? '',
    row.latitudeBan?.toFixed(6) ?? '',
    row.longitudeBan?.toFixed(6) ?? '',
    row.distanceMetres?.toFixed(0) ?? '',
    row.visibleCarto ? 'oui' : 'non',
    row.activitesCount,
  ].join(';')

const categorize = (anomalies: string[]): Categorie => {
  if (anomalies.length === 0) return 'ok'
  if (anomalies.length > 1) return 'multi_anomalies'
  if (anomalies.includes('score_faible')) return 'score_faible'
  if (anomalies.includes('code_postal_divergent'))
    return 'code_postal_divergent'
  if (anomalies.includes('code_insee_divergent')) return 'code_insee_divergent'
  if (anomalies.includes('commune_divergente')) return 'commune_divergente'
  if (anomalies.includes('ecart_geographique')) return 'ecart_geographique'
  return 'multi_anomalies'
}

export const executeAuditAdresseCoherence = async (
  job: AuditAdresseCoherenceJob,
) => {
  const limit = job.payload?.limit

  output.log(
    `audit-adresse-coherence: starting...${limit ? ` (limit: ${limit})` : ''}`,
  )

  const structures = await prismaClient.structure.findMany({
    where: { suppression: null },
    select: {
      id: true,
      siret: true,
      nom: true,
      adresse: true,
      commune: true,
      codePostal: true,
      codeInsee: true,
      latitude: true,
      longitude: true,
      visiblePourCartographieNationale: true,
      activitesCount: true,
    },
    orderBy: { creation: 'asc' },
    ...(limit ? { take: limit } : {}),
  })

  output.log(
    `audit-adresse-coherence: ${structures.length} structures à vérifier`,
  )

  const rows: AuditRow[] = []

  const counts: Record<Categorie, number> = {
    ok: 0,
    score_faible: 0,
    code_postal_divergent: 0,
    code_insee_divergent: 0,
    commune_divergente: 0,
    ecart_geographique: 0,
    adresse_introuvable: 0,
    sans_coordonnees: 0,
    multi_anomalies: 0,
  }

  for (let i = 0; i < structures.length; i += BATCH_SIZE) {
    const batch = structures.slice(i, i + BATCH_SIZE)

    output.log(
      `audit-adresse-coherence: progress ${i + batch.length}/${structures.length}`,
    )

    for (const structure of batch) {
      const baseRow = {
        id: structure.id,
        siret: structure.siret ?? '',
        nomBase: structure.nom,
        adresseBase: structure.adresse,
        communeBase: structure.commune,
        codePostalBase: structure.codePostal,
        codeInseeBase: structure.codeInsee ?? '',
        latitudeBase: structure.latitude,
        longitudeBase: structure.longitude,
        visibleCarto: structure.visiblePourCartographieNationale,
        activitesCount: structure.activitesCount,
      }

      const query = `${structure.adresse}, ${structure.codePostal} ${structure.commune}`

      try {
        const feature = await searchAdresse(query)

        if (!feature) {
          counts.adresse_introuvable++
          rows.push({
            ...baseRow,
            categorie: 'adresse_introuvable',
            anomalies: 'adresse_introuvable',
            banScore: 0,
            adresseBan: '',
            communeBan: '',
            codePostalBan: '',
            codeInseeBan: '',
            latitudeBan: null,
            longitudeBan: null,
            distanceMetres: null,
          })
          continue
        }

        const banData = banFeatureToAdresseBanData(feature)
        const banScore = feature.properties.score

        // Détection des anomalies
        const anomalies: string[] = []

        if (banScore < SCORE_THRESHOLD) {
          anomalies.push('score_faible')
        }

        if (
          structure.codePostal &&
          banData.codePostal &&
          structure.codePostal !== banData.codePostal
        ) {
          anomalies.push('code_postal_divergent')
        }

        if (
          structure.codeInsee &&
          banData.codeInsee &&
          structure.codeInsee !== banData.codeInsee
        ) {
          anomalies.push('code_insee_divergent')
        }

        const normalizeCommune = (s: string) =>
          s
            .toLowerCase()
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .replace(/[^a-z\s]/g, '')
            .trim()

        if (
          structure.commune &&
          banData.commune &&
          normalizeCommune(structure.commune) !==
            normalizeCommune(banData.commune)
        ) {
          anomalies.push('commune_divergente')
        }

        let distanceMetres: number | null = null

        if (structure.latitude != null && structure.longitude != null) {
          distanceMetres = haversineDistance(
            structure.latitude,
            structure.longitude,
            banData.latitude,
            banData.longitude,
          )

          if (distanceMetres > DISTANCE_THRESHOLD_METRES) {
            anomalies.push('ecart_geographique')
          }
        } else {
          counts.sans_coordonnees++
          rows.push({
            ...baseRow,
            categorie: 'sans_coordonnees',
            anomalies: 'sans_coordonnees',
            banScore,
            adresseBan: banData.label ?? '',
            communeBan: banData.commune,
            codePostalBan: banData.codePostal,
            codeInseeBan: banData.codeInsee,
            latitudeBan: banData.latitude,
            longitudeBan: banData.longitude,
            distanceMetres: null,
          })
          continue
        }

        const categorie = categorize(anomalies)
        counts[categorie]++

        rows.push({
          ...baseRow,
          categorie,
          anomalies: anomalies.join(', '),
          banScore,
          adresseBan: banData.label ?? '',
          communeBan: banData.commune,
          codePostalBan: banData.codePostal,
          codeInseeBan: banData.codeInsee,
          latitudeBan: banData.latitude,
          longitudeBan: banData.longitude,
          distanceMetres,
        })
      } catch (error) {
        counts.adresse_introuvable++
        rows.push({
          ...baseRow,
          categorie: 'adresse_introuvable',
          anomalies: `erreur: ${error instanceof Error ? error.message : 'Unknown'}`,
          banScore: 0,
          adresseBan: '',
          communeBan: '',
          codePostalBan: '',
          codeInseeBan: '',
          latitudeBan: null,
          longitudeBan: null,
          distanceMetres: null,
        })
      }
    }

    if (i + BATCH_SIZE < structures.length) await delay(PAUSE_MS)
  }

  // ── Export CSV complet ──

  const csvLines = [csvHeader, ...rows.map(rowToCsv)]
  const filePath = join(process.cwd(), 'audit-adresse-coherence.csv')
  await writeFile(filePath, csvLines.join('\n'), 'utf-8')

  // ── Export CSV des anomalies uniquement ──

  const anomalies = rows.filter((r) => r.categorie !== 'ok')
  const anomaliesCsvLines = [csvHeader, ...anomalies.map(rowToCsv)]
  const anomaliesFilePath = join(
    process.cwd(),
    'audit-adresse-anomalies.csv',
  )
  await writeFile(anomaliesFilePath, anomaliesCsvLines.join('\n'), 'utf-8')

  // ── Rapport console ──

  output.log(`\n=== AUDIT ADRESSE - RÉSULTATS ===`)
  output.log(`Total vérifié: ${structures.length}`)
  for (const [categorie, count] of Object.entries(counts)) {
    if (count > 0) {
      output.log(`  ${categorie}: ${count}`)
    }
  }

  // Distribution des scores BAN
  const scores = rows.filter((r) => r.banScore > 0).map((r) => r.banScore)
  if (scores.length > 0) {
    const ranges = [
      { label: '< 0.3', min: 0, max: 0.3 },
      { label: '0.3 - 0.5', min: 0.3, max: 0.5 },
      { label: '0.5 - 0.7', min: 0.5, max: 0.7 },
      { label: '0.7 - 0.9', min: 0.7, max: 0.9 },
      { label: '≥ 0.9', min: 0.9, max: 2 },
    ]
    output.log(`\n--- Distribution des scores BAN ---`)
    for (const range of ranges) {
      const count = scores.filter(
        (s) => s >= range.min && s < range.max,
      ).length
      if (count > 0) {
        output.log(`  ${range.label}: ${count}`)
      }
    }
  }

  // Distribution des distances
  const distances = rows
    .filter((r) => r.distanceMetres != null)
    .map((r) => r.distanceMetres as number)
  if (distances.length > 0) {
    const distRanges = [
      { label: '< 100m', min: 0, max: 100 },
      { label: '100m - 500m', min: 100, max: 500 },
      { label: '500m - 1km', min: 500, max: 1000 },
      { label: '1km - 5km', min: 1000, max: 5000 },
      { label: '5km - 50km', min: 5000, max: 50_000 },
      { label: '> 50km', min: 50_000, max: Number.POSITIVE_INFINITY },
    ]
    output.log(`\n--- Distribution des écarts géographiques ---`)
    for (const range of distRanges) {
      const count = distances.filter(
        (d) => d >= range.min && d < range.max,
      ).length
      if (count > 0) {
        output.log(`  ${range.label}: ${count}`)
      }
    }
  }

  output.log(`\nExport complet: ${filePath} (${rows.length} lignes)`)
  output.log(
    `Export anomalies: ${anomaliesFilePath} (${anomalies.length} lignes)`,
  )

  output.log(`\naudit-adresse-coherence: terminé`)

  return {
    total: structures.length,
    counts,
    exports: {
      complet: filePath,
      anomalies: anomaliesFilePath,
    },
  }
}
