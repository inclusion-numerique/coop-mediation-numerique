import {
  comptesParMotif,
  confierLAdresseAuLieu,
  consulterLAnnuaire,
  deposerLeReleve,
  descendreLeResume,
  dossierDuReleve,
  effacerLeRna,
  geocoderLesAdresses,
  interrogerSirene,
  lireLesLieux,
  nettoyerLaPresentation,
  releveEnLignes,
  reprendreLAdresse,
  reprendreLeComplement,
  reprendreLeLien,
  reprendreLeNom,
  reprendreLeSiret,
  reprendreLesCourriels,
  reprendreLesDonneesDesLieux,
  reprendreLesHoraires,
  reprendreLesSitesWeb,
  reprendreLeTelephone,
  repriseDeLAdresse,
  repriseDeLaPresentation,
  repriseDeLaPublication,
  repriseDesCourriels,
  repriseDesHoraires,
  repriseDesSitesWeb,
  repriseDuComplementDAdresse,
  repriseDuLien,
  repriseDuNom,
  repriseDuPivot,
  repriseDuResume,
  repriseDuSiret,
  repriseDuTelephone,
  reprisesRetenues,
  retirerLaPublication,
  retrouverParLesCoordonnees,
  sansConfiementDeLAdresse,
  sansDescenteDuResume,
  sansEffacementDuRna,
  sansNettoyageDeLaPresentation,
  sansRepriseDeLAdresse,
  sansRepriseDesCourriels,
  sansRepriseDesHoraires,
  sansRepriseDesSitesWeb,
  sansRepriseDuComplement,
  sansRepriseDuLien,
  sansRepriseDuNom,
  sansRepriseDuSiret,
  sansRepriseDuTelephone,
  sansRetraitDePublication,
  sansSuppressionDuLieu,
  sansTri,
  situerLesAdressesDuRegistreLocal,
  supprimerLeLieu,
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
    reprises: reprisesRetenues(
      [
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
        repriseDuNom(reprendre ? reprendreLeNom : sansRepriseDuNom),
        repriseDuLien(
          'ficheAccesLibre',
          reprendre ? reprendreLeLien : sansRepriseDuLien,
        ),
        repriseDuLien(
          'priseRdv',
          reprendre ? reprendreLeLien : sansRepriseDuLien,
        ),
        repriseDeLaPresentation(
          reprendre ? nettoyerLaPresentation : sansNettoyageDeLaPresentation,
        ),
        repriseDuComplementDAdresse(
          reprendre ? reprendreLeComplement : sansRepriseDuComplement,
        ),
        repriseDeLAdresse(
          geocoderLesAdresses,
          retrouverParLesCoordonnees,
          situerLesAdressesDuRegistreLocal,
          consulterLAnnuaire,
          reprendre ? reprendreLAdresse : sansRepriseDeLAdresse,
          reprendre ? supprimerLeLieu : sansSuppressionDuLieu,
          reprendre ? confierLAdresseAuLieu : sansConfiementDeLAdresse,
          new Date(),
        ),
        repriseDuSiret({
          geocoderLesAdresses,
          retrouverParLesCoordonnees,
          situerLesAdressesConsignees: situerLesAdressesDuRegistreLocal,
          consulterLAnnuaire,
          interrogerSirene,
          reprendreLeSiret: reprendre ? reprendreLeSiret : sansRepriseDuSiret,
          maintenant: new Date(),
        }),
      ],
      job.payload?.reprises,
    ),
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
