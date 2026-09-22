import {
  comptesParMotif,
  deposerLeReleve,
  descendreLeResume,
  dossierDuReleve,
  effacerLeRna,
  lireLesLieux,
  releveEnLignes,
  reprendreLesCourriels,
  reprendreLesDonneesDesLieux,
  reprendreLesHoraires,
  reprendreLesSitesWeb,
  reprendreLeTelephone,
  repriseDeLaPublication,
  repriseDesCourriels,
  repriseDesHoraires,
  repriseDesSitesWeb,
  repriseDuPivot,
  repriseDuResume,
  repriseDuTelephone,
  retirerLaPublication,
  sansDescenteDuResume,
  sansEffacementDuRna,
  sansRepriseDesCourriels,
  sansRepriseDesHoraires,
  sansRepriseDesSitesWeb,
  sansRepriseDuTelephone,
  sansRetraitDePublication,
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

  const journal = (message: string) =>
    output.log(`reprendre-les-donnees-des-lieux: ${message}`)

  const { releve, lieuxRepris, fichiers } = await reprendreLesDonneesDesLieux({
    reprises: [
      triDesListes(reprendre ? trierLesListes : sansTri),
      repriseDesHoraires(
        reprendre ? reprendreLesHoraires : sansRepriseDesHoraires,
      ),
      repriseDuTelephone(
        reprendre ? reprendreLeTelephone : sansRepriseDuTelephone,
      ),
      repriseDesCourriels(
        reprendre ? reprendreLesCourriels : sansRepriseDesCourriels,
      ),
      repriseDesSitesWeb(
        reprendre ? reprendreLesSitesWeb : sansRepriseDesSitesWeb,
      ),
      repriseDuPivot(reprendre ? effacerLeRna : sansEffacementDuRna),
      repriseDuResume(reprendre ? descendreLeResume : sansDescenteDuResume),
      repriseDeLaPublication(
        reprendre ? retirerLaPublication : sansRetraitDePublication,
      ),
    ],
    ports: {
      lireLesLieux,
      journal,
      deposerLeReleve,
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
