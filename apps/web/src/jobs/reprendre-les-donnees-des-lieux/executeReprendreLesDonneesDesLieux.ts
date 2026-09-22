import {
  deposerLeReleve,
  dossierDuReleve,
  lireLesLieux,
  rangerLesListes,
  releveEnLignes,
  reprendreLesDonnees,
  sansDepot,
  sansRangement,
} from '@app/web/features/lieux-activite/abilities/reprendre-les-donnees'
import type { JobExecutor } from '@app/web/jobs/jobExecutors'
import { output } from '@app/web/jobs/output'

export const executeReprendreLesDonneesDesLieux: JobExecutor<
  'reprendre-les-donnees-des-lieux'
> = async (job) => {
  const reprendre = job.payload?.reprendre ?? false
  const csv = job.payload?.csv ?? true

  const journal = (message: string) =>
    output.log(`reprendre-les-donnees-des-lieux: ${message}`)

  const { releve, listesRangees, fichiers } = await reprendreLesDonnees({
    ports: {
      lireLesLieux,
      journal,
      rangerLesListes: reprendre ? rangerLesListes : sansRangement,
      deposerLeReleve: csv ? deposerLeReleve : sansDepot,
    },
  })

  journal(
    [
      ...releveEnLignes(releve),
      '',
      `${listesRangees} lieux dont les listes sont à ranger${reprendre ? ', rangées dans la coop et au registre' : ' (À BLANC)'}`,
      ...fichiers.map((fichier) => `  ${dossierDuReleve()}/${fichier}`),
    ].join('\n'),
  )

  return {
    lieuxMesures: releve.lieuxMesures,
    lieuxSains: releve.lieuxSains,
    lieuxEcartes: releve.lieuxEcartes,
    postes: releve.postes,
    listesRangees,
    reprendre,
  }
}
