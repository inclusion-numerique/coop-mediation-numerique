import {
  auditerLesDonnees,
  lieuxAAuditer,
  listesATrier,
  type Releve,
  trierLesListes,
} from '@app/web/features/lieux-activite/abilities/auditer-les-donnees'
import type { JobExecutor } from '@app/web/jobs/jobExecutors'
import { output } from '@app/web/jobs/output'
import { CODES_DE_LISTE, dossierDuReleve, releveEnCsv } from './releve-en-csv'

const LARGEUR_CODE = 28

/**
 * Le compte des lieux touchés par colonne de vocabulaire.
 *
 * Le poste dit combien de lieux ont une liste à reprendre ; celui-ci dit
 * lesquelles. C'est ce qui permet de décider colonne par colonne plutôt que
 * d'affronter les huit mille d'un bloc.
 */
const lieuxParColonne = (releve: Releve): readonly [string, number][] => {
  const parColonne = new Map<string, Set<string>>()

  for (const anomalie of releve.detail)
    if (CODES_DE_LISTE.has(anomalie.code))
      parColonne.set(
        anomalie.champ,
        (parColonne.get(anomalie.champ) ?? new Set<string>()).add(
          anomalie.lieuId,
        ),
      )

  return [...parColonne.entries()]
    .map(([colonne, lieux]): [string, number] => [colonne, lieux.size])
    .sort(([, gauche], [, droite]) => droite - gauche)
}

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

  const parColonne = lieuxParColonne(releve)
  if (parColonne.length > 0) {
    journal('')
    journal('listes à reprendre, colonne par colonne :')
    for (const [colonne, lieux] of parColonne)
      journal(`  ${colonne.padEnd(LARGEUR_CODE)} ${String(lieux).padStart(6)}`)
  }

  if (job.payload?.corriger ?? false) {
    journal('')
    journal('correction des listes à trier…')

    const aReprendre = lignes
      .map((ligne) => ({ ligne, champs: listesATrier(ligne) }))
      .filter(({ champs }) => champs.length > 0)

    let reprises = 0
    for (const { ligne, champs } of aReprendre) {
      await trierLesListes(ligne.id, champs)
      reprises += 1
      if (reprises % 500 === 0)
        journal(`  ${reprises} / ${aReprendre.length} lieux repris`)
    }

    journal(`${reprises} lieux repris, dans la coop et au registre`)
  }

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
