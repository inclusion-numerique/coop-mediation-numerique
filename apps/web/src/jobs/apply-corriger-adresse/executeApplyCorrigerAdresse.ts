import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { banFeatureToAdresseBanData } from '@app/web/external-apis/ban/banFeatureToAdresseBanData'
import { fetchSiretApiData } from '@app/web/features/structures/siret/fetchSiretData'
import type { SiretApiResponse } from '@app/web/features/structures/siret/SiretApiResponse'
import { getAuditOutputPath } from '@app/web/jobs/audit-output'
import {
  type ActionPlanRow,
  escapeCsvField,
  filterActionPlan,
  readActionPlan,
} from '@app/web/jobs/audit-csv'
import { output } from '@app/web/jobs/output'
import { prismaClient } from '@app/web/prismaClient'
import { writeFile } from 'node:fs/promises'
import type { ApplyCorrigerAdresseJob } from './applyCorrigerAdresseJob'

const BATCH_SIZE = 50
const PAUSE_MS = 1000
const delay = (ms: number) => new Promise((resolve) => setTimeout(resolve, ms))

const buildAddressFromApiData = (
  adresse: SiretApiResponse['data']['adresse'],
): string =>
  [
    adresse.numero_voie,
    adresse.indice_repetition_voie,
    adresse.type_voie,
    adresse.libelle_voie,
  ]
    .filter((part) => Boolean(part) && part !== 'null')
    .join(' ')

const dryRunCsvHeader = [
  'id',
  'nom',
  'adresse_actuelle',
  'commune_actuelle',
  'siret',
  'adresse_corrigee',
  'commune_corrigee',
  'code_postal_corrige',
  'code_insee_corrige',
  'latitude',
  'longitude',
  'source_correction',
  'statut',
].join(';')

type Result = {
  row: ActionPlanRow
  adresseCorrigee: string
  communeCorrigee: string
  codePostalCorrige: string
  codeInseeCorrige: string
  latitude: string
  longitude: string
  sourceCorrection: string
  statut: string
}

const resultToCsv = (r: Result): string =>
  [
    r.row.id,
    escapeCsvField(r.row.nom),
    escapeCsvField(r.row.adresse),
    escapeCsvField(r.row.commune),
    r.row.siret,
    escapeCsvField(r.adresseCorrigee),
    escapeCsvField(r.communeCorrigee),
    r.codePostalCorrige,
    r.codeInseeCorrige,
    r.latitude,
    r.longitude,
    r.sourceCorrection,
    r.statut,
  ].join(';')

export const executeApplyCorrigerAdresse = async (
  job: ApplyCorrigerAdresseJob,
) => {
  const dryRun = job.payload?.dryRun ?? true

  output.log(
    `apply-corriger-adresse: starting${dryRun ? ' (DRY RUN)' : ''}...`,
  )

  const actionPlan = await readActionPlan()
  const toFix = filterActionPlan(actionPlan, 'corriger_adresse')

  output.log(`apply-corriger-adresse: ${toFix.length} adresses à corriger`)

  if (toFix.length === 0) {
    return { dryRun, total: 0, corrected: 0, skipped: 0 }
  }

  const results: Result[] = []
  let corrected = 0
  let skipped = 0

  for (let i = 0; i < toFix.length; i += BATCH_SIZE) {
    const batch = toFix.slice(i, i + BATCH_SIZE)

    output.log(
      `apply-corriger-adresse: progress ${i + batch.length}/${toFix.length}`,
    )

    for (const row of batch) {
      const structure = await prismaClient.structure.findUnique({
        where: { id: row.id },
        select: {
          id: true,
          siret: true,
          adresse: true,
          commune: true,
          codePostal: true,
          nom: true,
        },
      })

      if (!structure) {
        results.push({
          row,
          adresseCorrigee: '',
          communeCorrigee: '',
          codePostalCorrige: '',
          codeInseeCorrige: '',
          latitude: '',
          longitude: '',
          sourceCorrection: '',
          statut: 'introuvable',
        })
        skipped++
        continue
      }

      // Stratégie 1 : si SIRET disponible, récupérer l'adresse via API Entreprise
      if (structure.siret) {
        const siretResult = await fetchSiretApiData(structure.siret)

        if (!('error' in siretResult)) {
          const { data: { adresse } } = siretResult
          const adresseApi = buildAddressFromApiData(adresse)
          const communeApi = adresse.libelle_commune ?? ''
          const codePostalApi = adresse.code_postal
          const codeInseeApi = adresse.code_commune ?? ''

          if (adresseApi) {
            // Géocoder l'adresse API Entreprise via BAN
            const fullAdresse = `${adresseApi}, ${codePostalApi} ${communeApi}`
            const feature = await searchAdresse(fullAdresse)
            const banData = feature
              ? banFeatureToAdresseBanData(feature)
              : null

            const result: Result = {
              row,
              adresseCorrigee: adresseApi,
              communeCorrigee: communeApi,
              codePostalCorrige: codePostalApi,
              codeInseeCorrige: codeInseeApi,
              latitude: banData?.latitude?.toFixed(6) ?? '',
              longitude: banData?.longitude?.toFixed(6) ?? '',
              sourceCorrection: 'api_entreprise+ban',
              statut: dryRun ? 'a_corriger' : 'corrigee',
            }

            if (!dryRun) {
              await prismaClient.structure.update({
                where: { id: row.id },
                data: {
                  adresse: adresseApi,
                  commune: communeApi,
                  codePostal: codePostalApi,
                  codeInsee: codeInseeApi,
                  ...(banData
                    ? {
                        latitude: banData.latitude,
                        longitude: banData.longitude,
                        banId: banData.id,
                      }
                    : {}),
                  modification: new Date(),
                },
              })
            }

            results.push(result)
            corrected++
            continue
          }
        }
      }

      // Stratégie 2 : géocoder l'adresse existante via BAN (si non vide)
      const adresseExistante = structure.adresse?.trim()
      if (adresseExistante && adresseExistante.length > 1) {
        const query = `${adresseExistante}, ${structure.codePostal} ${structure.commune}`
        const feature = await searchAdresse(query)

        if (feature && feature.properties.score >= 0.5) {
          const banData = banFeatureToAdresseBanData(feature)

          const result: Result = {
            row,
            adresseCorrigee: banData.nom,
            communeCorrigee: banData.commune,
            codePostalCorrige: banData.codePostal,
            codeInseeCorrige: banData.codeInsee,
            latitude: banData.latitude.toFixed(6),
            longitude: banData.longitude.toFixed(6),
            sourceCorrection: 'ban',
            statut: dryRun ? 'a_corriger' : 'corrigee',
          }

          if (!dryRun) {
            await prismaClient.structure.update({
              where: { id: row.id },
              data: {
                adresse: banData.nom,
                commune: banData.commune,
                codePostal: banData.codePostal,
                codeInsee: banData.codeInsee,
                latitude: banData.latitude,
                longitude: banData.longitude,
                banId: banData.id,
                modification: new Date(),
              },
            })
          }

          results.push(result)
          corrected++
          continue
        }
      }

      // Aucune correction possible
      results.push({
        row,
        adresseCorrigee: '',
        communeCorrigee: '',
        codePostalCorrige: '',
        codeInseeCorrige: '',
        latitude: '',
        longitude: '',
        sourceCorrection: '',
        statut: 'non_corrigeable',
      })
      skipped++
    }

    if (i + BATCH_SIZE < toFix.length) await delay(PAUSE_MS)
  }

  // ── Export CSV ──

  const csvLines = [dryRunCsvHeader, ...results.map(resultToCsv)]
  const suffix = dryRun ? 'dry-run' : 'applied'
  const filePath = getAuditOutputPath(`apply-corriger-adresse-${suffix}.csv`)
  await writeFile(filePath, csvLines.join('\n'), 'utf-8')

  // ── Rapport ──

  output.log(
    `\n=== CORRIGER ADRESSE ${dryRun ? '(DRY RUN)' : ''} - RÉSULTATS ===`,
  )
  output.log(`Total: ${toFix.length}`)
  output.log(`${dryRun ? 'À corriger' : 'Corrigées'}: ${corrected}`)
  output.log(`Non corrigeables: ${skipped}`)
  output.log(`Export: ${filePath}`)

  output.log(`\napply-corriger-adresse: terminé`)

  return {
    dryRun,
    total: toFix.length,
    corrected,
    skipped,
    export: filePath,
  }
}
