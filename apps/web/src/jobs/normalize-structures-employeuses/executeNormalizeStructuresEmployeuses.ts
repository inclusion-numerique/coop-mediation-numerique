import { fetchSiretApiData } from '@app/web/features/structures/siret/fetchSiretData'
import {
  alignEmployeuseIdentity,
  clearSiret,
  getSiretBearingStructures,
  markSiretSynchronised,
  type SiretBearingStructure,
} from '@app/web/features/structures/siret/siretBearingStructures'
import {
  ADRESSE_SIMILARITY_THRESHOLD,
  diceSimilarity,
  NOM_SIMILARITY_THRESHOLD,
  parseSireneIdentity,
  throttleApiEntreprise,
} from '@app/web/features/structures/siret/siretIdentity'
import type { JobExecutor } from '../jobExecutors'
import { output } from '../output'

// Ce job traite le SIRET des DEUX tables (nom historique conservé) :
// - EMPLOYEUSE (structure_administrative) : on ALIGNE nom/adresse sur l'identité légale SIRENE.
// - LIEU (lieu_inclusion) : le SIRET est optionnel ; on ne touche JAMAIS au nom du lieu. On
//   VÉRIFIE par fuzzy match (nom OU adresse) que le SIRET correspond ; sinon on EFFACE le SIRET.

const shouldSkip = (
  structure: SiretBearingStructure,
  cutoffDate: Date,
): boolean =>
  structure.synchronisationSiret != null &&
  structure.synchronisationSiret > cutoffDate

const identityChanged = (
  structure: SiretBearingStructure,
  identity: {
    nom: string
    adresse: string
    commune: string
    codePostal: string
    codeInsee: string
  },
): boolean =>
  structure.nom !== identity.nom ||
  structure.adresse !== identity.adresse ||
  structure.commune !== identity.commune ||
  structure.codePostal !== identity.codePostal ||
  structure.codeInsee !== identity.codeInsee

// Le SIRET « correspond » au lieu si le nom ET l'adresse SIRENE atteignent leur seuil de
// similarité. Dès qu'un des deux diverge, on considère que le SIRET ne correspond pas.
const siretMatchesLieu = (
  structure: SiretBearingStructure,
  identity: { nom: string; adresse: string },
): boolean =>
  diceSimilarity(structure.nom, identity.nom) >= NOM_SIMILARITY_THRESHOLD &&
  diceSimilarity(structure.adresse, identity.adresse) >=
    ADRESSE_SIMILARITY_THRESHOLD

export const executeNormalizeStructuresEmployeuses: JobExecutor<
  'normalize-structures-employeuses'
> = async (job) => {
  const dryRun = job.payload?.dryRun ?? false
  const minDaysSinceLastSync = job.payload?.minDaysSinceLastSync ?? 7
  const cutoffDate = new Date(
    Date.now() - minDaysSinceLastSync * 24 * 60 * 60 * 1000,
  )

  output.log(
    `normalize-siret: starting${dryRun ? ' (DRY RUN)' : ''} (minDaysSinceLastSync: ${minDaysSinceLastSync})`,
  )

  const structures = await getSiretBearingStructures()

  output.log(`normalize-siret: ${structures.length} structures à SIRET`)

  const results = {
    total: structures.length,
    dryRun,
    employeusesAlignees: 0,
    employeusesInchangees: 0,
    lieuxVerifies: 0,
    lieuxSiretEfface: 0,
    ignores: 0,
    echecs: 0,
  }

  for (const [index, structure] of structures.entries()) {
    if ((index + 1) % 50 === 0) {
      output.log(`normalize-siret: progress ${index + 1}/${structures.length}`)
    }

    if (shouldSkip(structure, cutoffDate)) {
      results.ignores++
      continue
    }

    try {
      const siretResult = await fetchSiretApiData(structure.siret)
      await throttleApiEntreprise()

      // Erreur API / SIRET invalide : pour un LIEU c'est un SIRET qui ne correspond pas -> on l'efface.
      if ('error' in siretResult) {
        if (structure.source === 'lieu') {
          if (!dryRun) await clearSiret(structure)
          results.lieuxSiretEfface++
        } else {
          output.log(
            `normalize-siret: erreur API employeuse ${structure.id} (SIRET ${structure.siret}): ${siretResult.error.message}`,
          )
          results.echecs++
        }
        continue
      }

      const parsed = parseSireneIdentity(siretResult)

      if (structure.source === 'employeuse') {
        // Employeuse : alignement sur l'identité légale. Établissement fermé / personne
        // physique -> on ne peut pas aligner, on laisse en échec pour revue humaine.
        if ('failure' in parsed) {
          output.log(
            `normalize-siret: employeuse ${structure.id} non alignable (${parsed.failure})`,
          )
          results.echecs++
          continue
        }

        if (identityChanged(structure, parsed.identity)) {
          if (!dryRun)
            await alignEmployeuseIdentity(structure.id, {
              nom: parsed.identity.nom,
              adresse: parsed.identity.adresse,
              commune: parsed.identity.commune,
              codePostal: parsed.identity.codePostal,
              codeInsee: parsed.identity.codeInsee,
            })
          results.employeusesAlignees++
        } else {
          if (!dryRun) await markSiretSynchronised(structure)
          results.employeusesInchangees++
        }
        continue
      }

      // Lieu : validation. On ne modifie jamais le nom/adresse du lieu.
      const correspond =
        'identity' in parsed && siretMatchesLieu(structure, parsed.identity)

      if (correspond) {
        if (!dryRun) await markSiretSynchronised(structure)
        results.lieuxVerifies++
      } else {
        if (!dryRun) await clearSiret(structure)
        results.lieuxSiretEfface++
      }
    } catch (error) {
      output.log(
        `normalize-siret: erreur ${structure.source} ${structure.id}: ${error instanceof Error ? error.message : 'Unknown error'}`,
      )
      results.echecs++
    }
  }

  output.log(
    `normalize-siret: terminé — employeuses alignées ${results.employeusesAlignees}, inchangées ${results.employeusesInchangees}, lieux vérifiés ${results.lieuxVerifies}, SIRET lieu effacés ${results.lieuxSiretEfface}, ignorés ${results.ignores}, échecs ${results.echecs}${dryRun ? ' (DRY RUN)' : ''}`,
  )

  return results
}
