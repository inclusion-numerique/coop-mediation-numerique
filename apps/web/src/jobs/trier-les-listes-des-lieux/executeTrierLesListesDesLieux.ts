import {
  deposerLeReleve,
  dossierDuReleve,
  lireLesLieux,
  releveEnLignes,
  sansDepot,
  sansTri,
  trierLesListes,
  trierLesListesDesLieux,
} from '@app/web/features/lieux-activite/abilities/trier-les-listes-des-lieux'
import type { JobExecutor } from '@app/web/jobs/jobExecutors'
import { output } from '@app/web/jobs/output'

export const executeTrierLesListesDesLieux: JobExecutor<
  'trier-les-listes-des-lieux'
> = async (job) => {
  const trier = job.payload?.trier ?? false
  const csv = job.payload?.csv ?? true

  const journal = (message: string) =>
    output.log(`trier-les-listes-des-lieux: ${message}`)

  const { releve, lieuxTries, fichiers } = await trierLesListesDesLieux({
    ports: {
      lireLesLieux,
      journal,
      trierLesListes: trier ? trierLesListes : sansTri,
      deposerLeReleve: csv ? deposerLeReleve : sansDepot,
    },
  })

  journal(
    [
      ...releveEnLignes(releve),
      '',
      `${lieuxTries} lieux${trier ? ' triés, dans la coop et au registre' : ' à trier (À BLANC)'}`,
      ...fichiers.map((fichier) => `  ${dossierDuReleve()}/${fichier}`),
    ].join('\n'),
  )

  return {
    lieuxMesures: releve.lieuxMesures,
    lieuxATrier: releve.lieux.length,
    colonnes: releve.colonnes,
    lieuxTries,
    trier,
  }
}
