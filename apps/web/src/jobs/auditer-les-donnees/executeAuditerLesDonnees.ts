import {
  auditerLesDonnees,
  lieuxAAuditer,
} from '@app/web/features/lieux-activite/abilities/auditer-les-donnees'
import type { JobExecutor } from '@app/web/jobs/jobExecutors'
import { output } from '@app/web/jobs/output'
import { dossierDuReleve, releveEnCsv } from './releve-en-csv'

const LARGEUR_CODE = 28

const pourcent = (part: number, total: number): string =>
  total === 0 ? '—' : `${((part / total) * 100).toFixed(1)} %`

/**
 * Mesure l'écart entre ce que la base porte et ce que les règles attendent.
 *
 * Phase de détection seulement : le job ne corrige rien. Il confronte chaque
 * valeur au modèle du standard qui la gouverne désormais, et rend de quoi
 * décider — combien de lieux, pour quel motif, avec des exemples.
 */
export const executeAuditerLesDonnees: JobExecutor<
  'auditer-les-donnees'
> = async (job) => {
  const journal = (message: string) =>
    output.log(`auditer-les-donnees: ${message}`)

  journal('lecture des lieux actifs…')
  const lignes = await lieuxAAuditer()
  journal(`${lignes.length} lieux lus`)

  const releve = auditerLesDonnees(lignes)

  journal('')
  journal(`lieux audités  ${releve.lieuxAudites}`)
  journal(
    `sans anomalie  ${releve.lieuxSains} (${pourcent(releve.lieuxSains, releve.lieuxAudites)})`,
  )
  journal(
    `écartés        ${releve.lieuxEcartes} (${pourcent(releve.lieuxEcartes, releve.lieuxAudites)}) — une règle bloquante les retire de la cartographie`,
  )
  journal('')
  journal(
    `${'code'.padEnd(LARGEUR_CODE)} ${'lieux'.padStart(6)} ${'occurr.'.padStart(8)}  gravité`,
  )

  for (const poste of releve.postes)
    journal(
      `${poste.code.padEnd(LARGEUR_CODE)} ${String(poste.lieux).padStart(6)} ${String(poste.occurrences).padStart(8)}  ${poste.gravite}`,
    )

  journal('')
  for (const poste of releve.postes.filter(
    ({ exemples }) => exemples.length > 0,
  ))
    journal(`${poste.code} — ${poste.exemples.join(' · ')}`)

  if (job.payload?.csv ?? true) {
    const fichiers = releveEnCsv(releve)
    journal('')
    journal(`relevé détaillé dans ${dossierDuReleve()}`)
    for (const fichier of fichiers) journal(`  ${fichier}`)
  }

  return {
    lieuxAudites: releve.lieuxAudites,
    lieuxSains: releve.lieuxSains,
    lieuxEcartes: releve.lieuxEcartes,
    postes: releve.postes,
  }
}
