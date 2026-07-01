import { writeFile } from 'node:fs/promises'
import { fetchSiretApiData } from '@app/web/features/structures/siret/fetchSiretData'
import {
  getSiretBearingStructures,
  type SiretBearingStructure,
  type SiretSource,
} from '@app/web/features/structures/siret/siretBearingStructures'
import {
  ADRESSE_SIMILARITY_THRESHOLD,
  diceSimilarity,
  NOM_SIMILARITY_THRESHOLD,
  parseSireneIdentity,
  throttleApiEntreprise,
} from '@app/web/features/structures/siret/siretIdentity'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import { output } from '@app/web/jobs/output'
import type { AuditSiretCoherenceJob } from './auditSiretCoherenceJob'

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
  source: SiretSource
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
  visibleCarto: boolean | null
  activitesCount: number | null
  emploisCount: number
  mediateursCount: number | null
  erreur: string
}

const escapeCsvField = (value: string) =>
  value.includes(';') || value.includes('"') || value.includes('\n')
    ? `"${value.replace(/"/g, '""')}"`
    : value

const optional = (value: number | null): string =>
  value === null ? '' : String(value)

const categorize = (
  similariteNom: number,
  similariteAdresse: number,
): Categorie => {
  const nomOk = similariteNom >= NOM_SIMILARITY_THRESHOLD
  const adresseOk = similariteAdresse >= ADRESSE_SIMILARITY_THRESHOLD

  if (nomOk && adresseOk) return 'ok'
  if (!nomOk && !adresseOk) return 'nom_et_adresse_divergents'
  if (!nomOk) return 'nom_divergent'
  return 'adresse_divergente'
}

const csvHeader = [
  'id',
  'source',
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
    row.source,
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
    row.visibleCarto === null ? '' : row.visibleCarto ? 'oui' : 'non',
    optional(row.activitesCount),
    row.emploisCount,
    optional(row.mediateursCount),
    escapeCsvField(row.erreur),
  ].join(';')

const baseRowOf = (structure: SiretBearingStructure) => ({
  id: structure.id,
  source: structure.source,
  siret: structure.siret,
  nomBase: structure.nom,
  adresseBase: structure.adresse,
  communeBase: structure.commune,
  codePostalBase: structure.codePostal,
  visibleCarto: structure.visibleCarto,
  activitesCount: structure.activitesCount,
  emploisCount: structure.emploisCount,
  mediateursCount: structure.mediateursCount,
})

export const executeAuditSiretCoherence = async (
  job: AuditSiretCoherenceJob,
) => {
  const limit = job.payload?.limit

  output.log(
    `audit-siret-coherence: starting...${limit ? ` (limit: ${limit})` : ''}`,
  )

  const structures = await getSiretBearingStructures(limit ? { limit } : {})

  output.log(
    `audit-siret-coherence: ${structures.length} structures avec SIRET à vérifier (lieux + employeuses)`,
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

    const baseRow = baseRowOf(structure)
    const emptyApi = {
      nomApi: '',
      adresseApi: '',
      communeApi: '',
      codePostalApi: '',
      similariteNom: 0,
      similariteAdresse: 0,
      etatAdministratif: '',
    }

    try {
      const siretResult = await fetchSiretApiData(structure.siret)
      await throttleApiEntreprise()

      if ('error' in siretResult) {
        const categorie: Categorie =
          'statusCode' in siretResult.error &&
          siretResult.error.statusCode.toString().startsWith('4')
            ? 'siret_invalide'
            : 'erreur_api'
        counts[categorie]++
        rows.push({
          ...baseRow,
          ...emptyApi,
          categorie,
          erreur: siretResult.error.message,
        })
        continue
      }

      const parsed = parseSireneIdentity(siretResult)

      if ('failure' in parsed) {
        const categorie: Categorie = parsed.failure
        counts[categorie]++
        rows.push({
          ...baseRow,
          ...emptyApi,
          categorie,
          erreur:
            parsed.failure === 'personne_physique'
              ? 'Personne physique (pas de raison sociale)'
              : 'Établissement fermé',
        })
        continue
      }

      const { identity } = parsed
      const similariteNom = diceSimilarity(structure.nom, identity.nom)
      const similariteAdresse = diceSimilarity(
        structure.adresse,
        identity.adresse,
      )
      const categorie = categorize(similariteNom, similariteAdresse)

      counts[categorie]++
      rows.push({
        ...baseRow,
        categorie,
        nomApi: identity.nom,
        adresseApi: identity.adresse,
        communeApi: identity.commune,
        codePostalApi: identity.codePostal,
        similariteNom,
        similariteAdresse,
        etatAdministratif: identity.etatAdministratif,
        erreur: '',
      })
    } catch (error) {
      counts.erreur_api++
      rows.push({
        ...baseRow,
        ...emptyApi,
        categorie: 'erreur_api',
        erreur: error instanceof Error ? error.message : 'Unknown error',
      })
    }
  }

  const csvLines = [csvHeader, ...rows.map(rowToCsv)]
  const filePath = getAuditOutputPath('audit-siret-coherence.csv')
  await writeFile(filePath, csvLines.join('\n'), 'utf-8')

  const divergences = rows.filter(
    (r) => r.categorie !== 'ok' && r.categorie !== 'erreur_api',
  )
  const divergencesCsvLines = [csvHeader, ...divergences.map(rowToCsv)]
  const divergencesFilePath = getAuditOutputPath('audit-siret-divergences.csv')
  await writeFile(divergencesFilePath, divergencesCsvLines.join('\n'), 'utf-8')

  output.log('\n=== AUDIT SIRET - RÉSULTATS ===')
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
    exports: { complet: filePath, divergences: divergencesFilePath },
  }
}
