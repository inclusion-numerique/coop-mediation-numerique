import {
  deposerLeReleve,
  dossierDuReleve,
  lireLesLieux,
  releveEnLignes,
  reprendreLesDonneesDesLieux,
  sansDepot,
  sansTri,
  trierLesListes,
} from '@app/web/features/lieux-activite/abilities/reprendre-les-donnees-des-lieux'
import type { JobExecutor } from '@app/web/jobs/jobExecutors'
import { output } from '@app/web/jobs/output'

export const executeReprendreLesDonneesDesLieux: JobExecutor<
  'reprendre-les-donnees-des-lieux'
> = async (job) => {
  const reprendre = job.payload?.reprendre ?? false
  const csv = job.payload?.csv ?? true

  const journal = (message: string) =>
    output.log(`reprendre-les-donnees-des-lieux: ${message}`)

  const { releve, lieuxTries, fichiers } = await reprendreLesDonneesDesLieux({
    ports: {
      lireLesLieux,
      journal,
      trierLesListes: reprendre ? trierLesListes : sansTri,
      deposerLeReleve: csv ? deposerLeReleve : sansDepot,
    },
  })

  journal(
    [
      ...releveEnLignes(releve),
      '',
      `${lieuxTries} lieux${reprendre ? ' triés, dans la coop et au registre' : ' à trier (À BLANC)'}`,
      ...fichiers.map((fichier) => `  ${dossierDuReleve()}/${fichier}`),
    ].join('\n'),
  )

  return {
    lieuxMesures: releve.lieuxMesures,
    colonnesATrier: releve.listesATrier.colonnes,
    lieuxTries,
    reprendre,
  }
}
