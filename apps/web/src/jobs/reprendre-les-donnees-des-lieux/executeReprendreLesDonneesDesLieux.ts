import {
  comptesParMotif,
  deposerLeReleve,
  dossierDuReleve,
  lireLesLieux,
  releveEnLignes,
  reprendreLesDonneesDesLieux,
  reprendreLesHoraires,
  repriseDesHoraires,
  sansDepot,
  sansRepriseDesHoraires,
  sansTri,
  triDesListes,
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

  const { releve, lieuxRepris, fichiers } = await reprendreLesDonneesDesLieux({
    reprises: [
      triDesListes(reprendre ? trierLesListes : sansTri),
      repriseDesHoraires(
        reprendre ? reprendreLesHoraires : sansRepriseDesHoraires,
      ),
    ],
    ports: {
      lireLesLieux,
      journal,
      deposerLeReleve: csv ? deposerLeReleve : sansDepot,
    },
  })

  journal(
    [
      ...releveEnLignes(releve),
      '',
      `${lieuxRepris} lieux${reprendre ? ' repris, dans la coop et au registre' : ' à reprendre (À BLANC)'}`,
      ...fichiers.map((fichier) => `  ${dossierDuReleve()}/${fichier}`),
    ].join('\n'),
  )

  return {
    lieuxMesures: releve.lieuxMesures,
    lieuxAReprendre: releve.lieux.length,
    motifs: comptesParMotif(releve),
    lieuxRepris,
    reprendre,
  }
}
