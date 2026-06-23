import { prismaClient } from '@app/web/prismaClient'
import { v4 } from 'uuid'
import type { JobExecutor } from '../jobExecutors'
import { output } from '../output'

// Incrément 1a.1 du split `structures` → `lieu_inclusion` + `structure_administrative` :
// extrait l'identité légale des structures jouant un rôle employeuse dans une nouvelle
// `structure_administrative`, et relie chaque structure via `structureAdministrativeId`.
//
// Étape ADDITIVE et idempotente : ne repointe ni ne supprime aucune donnée existante.
// Le repointage des FK employeuse (employes_structures, activite.structureEmployeuse)
// et la suppression des structures employeuses-pures viennent dans les incréments 1a.2 / 1a.3.

type StructureToSplit = {
  id: string
  siret: string | null
  rna: string | null
  nomUsage: string | null
  synchronisationSiret: Date | null
  nom: string
  adresse: string
  commune: string
  codePostal: string
  codeInsee: string | null
  complementAdresse: string | null
  nomReferent: string | null
  courrielReferent: string | null
  telephoneReferent: string | null
}

// Rôle employeuse = a des emplois, des activités employeuses, ou une identité légale (siret).
// On ne reprend que les structures pas encore reliées (rejouable sans doublon).
const getStructuresEmployeusesToSplit = async (): Promise<StructureToSplit[]> =>
  prismaClient.structure.findMany({
    where: {
      structureAdministrativeId: null,
      // Note (split-1a.2) : depuis le repointage des relations employeuse vers
      // StructureAdministrative, on ne peut plus détecter le rôle via `emplois`/
      // `activitesEmployes` sur Structure. Le SIRET reste le signal employeuse
      // (cf. règle métier) ; les rares structures liées à un emploi sans SIRET ont
      // déjà été traitées lors du premier passage (1a.1).
      siret: { not: null },
    },
    select: {
      id: true,
      siret: true,
      rna: true,
      nomUsage: true,
      synchronisationSiret: true,
      nom: true,
      adresse: true,
      commune: true,
      codePostal: true,
      codeInsee: true,
      complementAdresse: true,
      nomReferent: true,
      courrielReferent: true,
      telephoneReferent: true,
    },
  })

export const executeBackfillStructuresAdministratives: JobExecutor<
  'backfill-structures-administratives'
> = async (job) => {
  const dryRun = job.payload?.dryRun ?? false

  const structures = await getStructuresEmployeusesToSplit()

  output.log(
    `backfill-structures-administratives: ${structures.length} structure(s) employeuse(s) à scinder${dryRun ? ' (DRY RUN)' : ''}`,
  )

  const results = { created: 0, failed: 0 }

  for (const structure of structures) {
    try {
      if (dryRun) {
        output.log(
          `backfill-structures-administratives: [DRY RUN] créerait structure_administrative pour ${structure.id} (siret: ${structure.siret ?? '∅'})`,
        )
        results.created++
        continue
      }

      const structureAdministrativeId = v4()

      await prismaClient.$transaction([
        prismaClient.structureAdministrative.create({
          data: {
            id: structureAdministrativeId,
            siret: structure.siret,
            rna: structure.rna,
            denomination: structure.nomUsage,
            synchronisationSiret: structure.synchronisationSiret,
            nom: structure.nom,
            adresse: structure.adresse,
            commune: structure.commune,
            codePostal: structure.codePostal,
            codeInsee: structure.codeInsee,
            complementAdresse: structure.complementAdresse,
            nomReferent: structure.nomReferent,
            courrielReferent: structure.courrielReferent,
            telephoneReferent: structure.telephoneReferent,
            source: 'coop',
          },
        }),
        prismaClient.structure.update({
          where: { id: structure.id },
          data: { structureAdministrativeId },
        }),
      ])

      results.created++
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : 'Unknown error'
      output.log(
        `backfill-structures-administratives: erreur sur la structure ${structure.id}: ${errorMessage}`,
      )
      results.failed++
    }
  }

  output.log(
    `backfill-structures-administratives: terminé - créées: ${results.created}, échecs: ${results.failed}${dryRun ? ' (DRY RUN)' : ''}`,
  )

  return results
}
