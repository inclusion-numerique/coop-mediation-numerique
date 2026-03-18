import { searchAdresse } from '@app/web/external-apis/apiAdresse'
import { banFeatureToAdresseBanData } from '@app/web/external-apis/ban/banFeatureToAdresseBanData'
import { fetchSiretApiData } from '@app/web/features/structures/siret/fetchSiretData'
import type { SiretApiResponse } from '@app/web/features/structures/siret/SiretApiResponse'
import { prismaClient } from '@app/web/prismaClient'
import type { JobExecutor } from '../jobExecutors'
import { output } from '../output'

// 250 req/min max sur l'API Entreprise = ~4 req/s = 250ms minimum entre chaque appel
const API_ENTREPRISE_THROTTLE_MS = 250

type StructureToNormalize = {
  id: string
  siret: string | null
  nom: string
  adresse: string
  commune: string
  codePostal: string
  codeInsee: string | null
  latitude: number | null
  longitude: number | null
  synchronisationSiret: Date | null
}

type NormalizedStructureData = {
  nom: string
  adresse: string
  commune: string
  codePostal: string
  codeInsee: string
}

type Coordinates = {
  latitude: number | null
  longitude: number | null
}

const getStructuresEmployeusesToNormalize = async (): Promise<
  StructureToNormalize[]
> =>
  prismaClient.structure.findMany({
    where: {
      siret: { not: null },
      suppression: null,
      emplois: {
        some: {
          suppression: null,
        },
      },
      mediateursEnActivite: {
        none: {},
      },
    },
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
      synchronisationSiret: true,
    },
  })

const shouldSkipStructure = (
  structure: StructureToNormalize,
  cutoffDate: Date,
): boolean =>
  structure.siret
    ? structure.synchronisationSiret != null &&
      structure.synchronisationSiret > cutoffDate
    : true

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

const parseApiEntrepriseResponse = (
  siretResult: SiretApiResponse,
): { error: string } | { data: NormalizedStructureData } => {
  const {
    data: {
      unite_legale: { personne_morale_attributs },
      etat_administratif,
      adresse,
    },
  } = siretResult

  if (!personne_morale_attributs?.raison_sociale) {
    return { error: 'no raison sociale' }
  }

  if (etat_administratif === 'F') {
    return { error: 'establishment closed' }
  }

  return {
    data: {
      nom: personne_morale_attributs.raison_sociale,
      adresse: buildAddressFromApiData(adresse),
      commune: adresse.libelle_commune || '',
      codePostal: adresse.code_postal,
      codeInsee: adresse.code_commune || '',
    },
  }
}

const hasStructureDataChanged = (
  structure: StructureToNormalize,
  data: NormalizedStructureData,
): boolean =>
  structure.nom !== data.nom ||
  structure.adresse !== data.adresse ||
  structure.commune !== data.commune ||
  structure.codePostal !== data.codePostal ||
  structure.codeInsee !== data.codeInsee

const hasAddressChanged = (
  structure: StructureToNormalize,
  data: NormalizedStructureData,
): boolean =>
  structure.adresse !== data.adresse ||
  structure.commune !== data.commune ||
  structure.codePostal !== data.codePostal ||
  structure.codeInsee !== data.codeInsee

const geocodeIfAddressChanged = async (
  structure: StructureToNormalize,
  data: NormalizedStructureData,
): Promise<Coordinates> => {
  if (!hasAddressChanged(structure, data)) {
    return { latitude: structure.latitude, longitude: structure.longitude }
  }

  const fullAdresse = `${data.adresse}, ${data.codePostal} ${data.commune}`
  const adresseResult = await searchAdresse(fullAdresse)

  if (adresseResult) {
    const banData = banFeatureToAdresseBanData(adresseResult)
    return { latitude: banData.latitude, longitude: banData.longitude }
  }

  return { latitude: null, longitude: null }
}

const updateStructureData = async (
  structureId: string,
  data: NormalizedStructureData,
  coordinates: Coordinates,
): Promise<void> => {
  const now = new Date()
  await prismaClient.structure.update({
    where: { id: structureId },
    data: {
      nom: data.nom,
      adresse: data.adresse,
      commune: data.commune,
      codePostal: data.codePostal,
      codeInsee: data.codeInsee,
      latitude: coordinates.latitude,
      longitude: coordinates.longitude,
      modification: now,
      synchronisationSiret: now,
    },
  })
}

const updateStructureSyncTimestamp = async (
  structureId: string,
): Promise<void> => {
  await prismaClient.structure.update({
    where: { id: structureId },
    data: { synchronisationSiret: new Date() },
  })
}

const logDryRunChanges = (
  structure: StructureToNormalize,
  data: NormalizedStructureData,
  coordinates: Coordinates,
  addressChanged: boolean,
): void => {
  output.log(
    `normalize-structures-employeuses: [DRY RUN] would update structure ${structure.id}:`,
  )
  output.log(`  nom: "${structure.nom}" -> "${data.nom}"`)
  output.log(`  adresse: "${structure.adresse}" -> "${data.adresse}"`)
  output.log(`  commune: "${structure.commune}" -> "${data.commune}"`)
  output.log(`  codePostal: "${structure.codePostal}" -> "${data.codePostal}"`)
  output.log(`  codeInsee: "${structure.codeInsee}" -> "${data.codeInsee}"`)
  if (addressChanged) {
    output.log(
      `  latitude: ${structure.latitude} -> ${coordinates.latitude}, longitude: ${structure.longitude} -> ${coordinates.longitude}`,
    )
  }
}

const throttle = () =>
  new Promise((resolve) => setTimeout(resolve, API_ENTREPRISE_THROTTLE_MS))

export const executeNormalizeStructuresEmployeuses: JobExecutor<
  'normalize-structures-employeuses'
> = async (job) => {
  const dryRun = job.payload?.dryRun ?? false
  const minDaysSinceLastSync = job.payload?.minDaysSinceLastSync ?? 7
  const cutoffDate = new Date(
    Date.now() - minDaysSinceLastSync * 24 * 60 * 60 * 1000,
  )

  output.log(
    `normalize-structures-employeuses: starting${dryRun ? ' (DRY RUN)' : ''} (minDaysSinceLastSync: ${minDaysSinceLastSync})`,
  )

  const structures = await getStructuresEmployeusesToNormalize()

  output.log(
    `normalize-structures-employeuses: found ${structures.length} structures to process`,
  )

  const results = {
    total: structures.length,
    updated: 0,
    unchanged: 0,
    skipped: 0,
    failed: 0,
    dryRun,
  }

  for (const [index, structure] of structures.entries()) {
    if ((index + 1) % 50 === 0) {
      output.log(
        `normalize-structures-employeuses: progress ${index + 1}/${structures.length}`,
      )
    }

    if (shouldSkipStructure(structure, cutoffDate)) {
      results.skipped++
      continue
    }

    try {
      const siretResult = await fetchSiretApiData(structure.siret as string)
      await throttle()

      if ('error' in siretResult) {
        output.log(
          `normalize-structures-employeuses: API error for structure ${structure.id} (SIRET: ${structure.siret}): ${siretResult.error.message}`,
        )
        results.failed++
        continue
      }

      const parsed = parseApiEntrepriseResponse(siretResult)

      if ('error' in parsed) {
        output.log(
          `normalize-structures-employeuses: ${parsed.error} for structure ${structure.id} (SIRET: ${structure.siret})`,
        )
        results.failed++
        continue
      }

      const { data } = parsed

      const dataChanged = hasStructureDataChanged(structure, data)
      const addressChanged = hasAddressChanged(structure, data)
      const coordinates = await geocodeIfAddressChanged(structure, data)

      if (dryRun) {
        if (dataChanged) {
          logDryRunChanges(structure, data, coordinates, addressChanged)
          results.updated++
        } else {
          output.log(
            `normalize-structures-employeuses: [DRY RUN] would update synchronisationSiret only for structure ${structure.id}`,
          )
          results.unchanged++
        }
        continue
      }

      if (dataChanged) {
        await updateStructureData(structure.id, data, coordinates)
        results.updated++
      } else {
        await updateStructureSyncTimestamp(structure.id)
        results.unchanged++
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      output.log(
        `normalize-structures-employeuses: error processing structure ${structure.id}: ${errorMessage}`,
      )
      results.failed++
    }
  }

  output.log(
    `normalize-structures-employeuses: completed - updated: ${results.updated}, unchanged: ${results.unchanged}, skipped: ${results.skipped}, failed: ${results.failed}${dryRun ? ' (DRY RUN)' : ''}`,
  )

  return results
}
