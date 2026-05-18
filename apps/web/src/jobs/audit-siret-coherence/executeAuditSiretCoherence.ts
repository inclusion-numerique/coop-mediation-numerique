import { writeFile } from 'node:fs/promises'
import { fetchSiretApiData } from '@app/web/features/structures/siret/fetchSiretData'
import type { SiretApiResponse } from '@app/web/features/structures/siret/SiretApiResponse'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import type { AuditSiretCoherenceJob } from './auditSiretCoherenceJob'

// 250 req/min max sur l'API Entreprise = ~4 req/s
const API_ENTREPRISE_THROTTLE_MS = 250

const throttle = () =>
  new Promise((resolve) => setTimeout(resolve, API_ENTREPRISE_THROTTLE_MS))

type Categorie =
  | 'ok'
  | 'nom_divergent'
  | 'adresse_divergente'
  | 'nom_et_adresse_divergents'
  | 'etablissement_ferme'
  | 'siret_invalide'
  | 'personne_physique'
  | 'erreur_api'

type AuditRow = {
  id: string
  siret: string
  categorie: Categorie
  nomBase: string
  nomApi: string
  adresseBase: string
  adresseApi: string
  communeBase: string
  communeApi: string
  codePostalBase: string
  codePostalApi: string
  similariteNom: number
  similariteAdresse: number
  etatAdministratif: string
  visibleCarto: boolean
  activitesCount: number
  emploisCount: number
  mediateursCount: number
  erreur: string
}

const escapeCsvField = (value: string) =>
  value.includes(';') || value.includes('"') || value.includes('\n')
    ? `"${value.replace(/"/g, '""')}"`
    : value

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9\s]/g, '')
    .replace(/\s+/g, ' ')
    .trim()

/**
 * Similarité de Dice (bigrams) entre deux chaînes normalisées.
 * Retourne un score entre 0 et 1.
 */
const diceSimilarity = (a: string, b: string): number => {
  const na = normalize(a)
  const nb = normalize(b)

  if (na === nb) return 1
  if (na.length < 2 || nb.length < 2) return 0

  const bigrams = (s: string) => {
    const set = new Map<string, number>()
    for (let i = 0; i < s.length - 1; i++) {
      const bigram = s.slice(i, i + 2)
      set.set(bigram, (set.get(bigram) ?? 0) + 1)
    }
    return set
  }

  const bigramsA = bigrams(na)
  const bigramsB = bigrams(nb)

  let intersection = 0
  for (const [bigram, countA] of bigramsA) {
    const countB = bigramsB.get(bigram) ?? 0
    intersection += Math.min(countA, countB)
  }

  const totalA = na.length - 1
  const totalB = nb.length - 1

  return (2 * intersection) / (totalA + totalB)
}

const buildAddressFromApiData = (
  adresse: SiretApiResponse['data']['adresse'],
): string =>
  [
    adresse.numero_voie,
    adresse.indice_repetition_voie,
    adresse.type_voie,
    adresse.libelle_voie,
    adresse.complement_adresse,
  ]
    .filter((part) => Boolean(part) && part !== 'null')
    .join(' ')

const NOM_SIMILARITY_THRESHOLD = 0.8
const ADRESSE_SIMILARITY_THRESHOLD = 0.7

const categorize = (
  similariteNom: number,
  similariteAdresse: number,
  etatAdministratif: string,
): Categorie => {
  if (etatAdministratif === 'F') return 'etablissement_ferme'

  const nomOk = similariteNom >= NOM_SIMILARITY_THRESHOLD
  const adresseOk = similariteAdresse >= ADRESSE_SIMILARITY_THRESHOLD

  if (nomOk && adresseOk) return 'ok'
  if (!nomOk && !adresseOk) return 'nom_et_adresse_divergents'
  if (!nomOk) return 'nom_divergent'
  return 'adresse_divergente'
}

const csvHeader = [
  'id',
  'siret',
  'categorie',
  'nom_base',
  'nom_api',
  'adresse_base',
  'adresse_api',
  'commune_base',
  'commune_api',
  'code_postal_base',
  'code_postal_api',
  'similarite_nom',
  'similarite_adresse',
  'etat_administratif',
  'visible_carto',
  'activites_count',
  'emplois_count',
  'mediateurs_count',
  'erreur',
].join(';')

const rowToCsv = (row: AuditRow): string =>
  [
    row.id,
    row.siret,
    row.categorie,
    escapeCsvField(row.nomBase),
    escapeCsvField(row.nomApi),
    escapeCsvField(row.adresseBase),
    escapeCsvField(row.adresseApi),
    escapeCsvField(row.communeBase),
    escapeCsvField(row.communeApi),
    row.codePostalBase,
    row.codePostalApi,
    row.similariteNom.toFixed(3),
    row.similariteAdresse.toFixed(3),
    row.etatAdministratif,
    row.visibleCarto ? 'oui' : 'non',
    row.activitesCount,
    row.emploisCount,
    row.mediateursCount,
    escapeCsvField(row.erreur),
  ].join(';')

export const executeAuditSiretCoherence = async (
  job: AuditSiretCoherenceJob,
) => {
  const limit = job.payload?.limit

  output.log(
    `audit-siret-coherence: starting...${limit ? ` (limit: ${limit})` : ''}`,
  )

  const structures = await prismaClient.structure.findMany({
    where: {
      suppression: null,
      siret: { not: null },
    },
    select: {
      id: true,
      siret: true,
      nom: true,
      adresse: true,
      commune: true,
      codePostal: true,
      visiblePourCartographieNationale: true,
      activitesCount: true,
      _count: {
        select: {
          emplois: true,
          mediateursEnActivite: true,
        },
      },
    },
    orderBy: { siret: 'asc' },
    ...(limit ? { take: limit } : {}),
  })

  output.log(
    `audit-siret-coherence: ${structures.length} structures avec SIRET à vérifier`,
  )

  const rows: AuditRow[] = []

  const counts: Record<Categorie, number> = {
    ok: 0,
    nom_divergent: 0,
    adresse_divergente: 0,
    nom_et_adresse_divergents: 0,
    etablissement_ferme: 0,
    siret_invalide: 0,
    personne_physique: 0,
    erreur_api: 0,
  }

  for (const [index, structure] of structures.entries()) {
    if ((index + 1) % 100 === 0) {
      output.log(
        `audit-siret-coherence: progress ${index + 1}/${structures.length}`,
      )
    }

    const siret = structure.siret as string

    const baseRow = {
      id: structure.id,
      siret,
      nomBase: structure.nom,
      adresseBase: structure.adresse,
      communeBase: structure.commune,
      codePostalBase: structure.codePostal,
      visibleCarto: structure.visiblePourCartographieNationale,
      activitesCount: structure.activitesCount,
      emploisCount: structure._count.emplois,
      mediateursCount: structure._count.mediateursEnActivite,
    }

    try {
      const siretResult = await fetchSiretApiData(siret)
      await throttle()

      if ('error' in siretResult) {
        const categorie: Categorie =
          'statusCode' in siretResult.error &&
          siretResult.error.statusCode.toString().startsWith('4')
            ? 'siret_invalide'
            : 'erreur_api'

        counts[categorie]++
        rows.push({
          ...baseRow,
          categorie,
          nomApi: '',
          adresseApi: '',
          communeApi: '',
          codePostalApi: '',
          similariteNom: 0,
          similariteAdresse: 0,
          etatAdministratif: '',
          erreur: siretResult.error.message,
        })
        continue
      }

      const {
        data: {
          unite_legale: { personne_morale_attributs },
          etat_administratif,
          adresse,
        },
      } = siretResult

      if (!personne_morale_attributs?.raison_sociale) {
        counts.personne_physique++
        rows.push({
          ...baseRow,
          categorie: 'personne_physique',
          nomApi: '',
          adresseApi: '',
          communeApi: '',
          codePostalApi: '',
          similariteNom: 0,
          similariteAdresse: 0,
          etatAdministratif: etat_administratif,
          erreur: 'Personne physique (pas de raison sociale)',
        })
        continue
      }

      const nomApi = personne_morale_attributs.raison_sociale
      const adresseApi = buildAddressFromApiData(adresse)
      const communeApi = adresse.libelle_commune ?? ''
      const codePostalApi = adresse.code_postal

      const similariteNom = diceSimilarity(structure.nom, nomApi)
      const similariteAdresse = diceSimilarity(structure.adresse, adresseApi)

      const categorie = categorize(
        similariteNom,
        similariteAdresse,
        etat_administratif,
      )

      counts[categorie]++
      rows.push({
        ...baseRow,
        categorie,
        nomApi,
        adresseApi,
        communeApi,
        codePostalApi,
        similariteNom,
        similariteAdresse,
        etatAdministratif: etat_administratif,
        erreur: '',
      })
    } catch (error) {
      counts.erreur_api++
      rows.push({
        ...baseRow,
        categorie: 'erreur_api',
        nomApi: '',
        adresseApi: '',
        communeApi: '',
        codePostalApi: '',
        similariteNom: 0,
        similariteAdresse: 0,
        etatAdministratif: '',
        erreur: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  // ── Export CSV complet ──

  const csvLines = [csvHeader, ...rows.map(rowToCsv)]
  const filePath = getAuditOutputPath('audit-siret-coherence.csv')
  await writeFile(filePath, csvLines.join('\n'), 'utf-8')

  // ── Export CSV des divergences uniquement ──

  const divergences = rows.filter(
    (r) => r.categorie !== 'ok' && r.categorie !== 'erreur_api',
  )
  const divergencesCsvLines = [csvHeader, ...divergences.map(rowToCsv)]
  const divergencesFilePath = getAuditOutputPath('audit-siret-divergences.csv')
  await writeFile(divergencesFilePath, divergencesCsvLines.join('\n'), 'utf-8')

  // ── Rapport console ──

  output.log(`\n=== AUDIT SIRET - RÉSULTATS ===`)
  output.log(`Total vérifié: ${structures.length}`)
  for (const [categorie, count] of Object.entries(counts)) {
    if (count > 0) {
      output.log(`  ${categorie}: ${count}`)
    }
  }
  output.log(`\nExport complet: ${filePath} (${rows.length} lignes)`)
  output.log(
    `Export divergences: ${divergencesFilePath} (${divergences.length} lignes)`,
  )

  return {
    total: structures.length,
    counts,
    exports: {
      complet: filePath,
      divergences: divergencesFilePath,
    },
  }
}
