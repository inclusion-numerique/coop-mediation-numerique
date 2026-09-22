import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type {
  AnomalieSituee,
  Releve,
} from '@app/web/features/lieux-activite/abilities/auditer-les-donnees'

const DOSSIER = 'output/audit-lieux'

const ENTETE =
  'lieu_id;code;gravite;champ;valeur;nom;commune;code_postal;publie'

/**
 * Un fichier par poste, pas un fichier pour tout.
 *
 * On ne juge pas 13 000 lignes mêlées : on ouvre le poste sur lequel on veut se
 * prononcer. Chaque ligne porte de quoi reconnaître le lieu — son nom, sa
 * commune, et s'il paraît sur la cartographie —, parce qu'un défaut sur un lieu
 * publié ne pèse pas comme le même sur un lieu que personne ne voit.
 */
const cellule = (valeur: string): string =>
  `"${valeur.replaceAll('"', '""').replaceAll('\n', ' ').replaceAll('\r', '')}"`

const ligneCsv = (anomalie: AnomalieSituee): string =>
  [
    anomalie.lieuId,
    anomalie.code,
    anomalie.gravite,
    anomalie.champ,
    cellule(anomalie.valeur),
    cellule(anomalie.nom),
    cellule(anomalie.commune),
    anomalie.codePostal,
    anomalie.publie ? 'oui' : 'non',
  ].join(';')

const parCode = (
  detail: readonly AnomalieSituee[],
): Map<string, AnomalieSituee[]> => {
  const groupes = new Map<string, AnomalieSituee[]>()

  for (const anomalie of detail)
    groupes.set(anomalie.code, [
      ...(groupes.get(anomalie.code) ?? []),
      anomalie,
    ])

  return groupes
}

export const releveEnCsv = (releve: Releve): readonly string[] => {
  const dossier = join(process.cwd(), DOSSIER)

  rmSync(dossier, { recursive: true, force: true })
  mkdirSync(dossier, { recursive: true })

  const ecrits = [...parCode(releve.detail).entries()].map(
    ([code, anomalies]) => {
      const chemin = join(dossier, `${code}.csv`)
      const lignes = [ENTETE, ...anomalies.map(ligneCsv)]

      writeFileSync(chemin, `${lignes.join('\n')}\n`, 'utf8')

      return `${code}.csv (${anomalies.length})`
    },
  )

  writeFileSync(
    join(dossier, 'releve.csv'),
    [
      'code;gravite;lieux;occurrences',
      ...releve.postes.map(({ code, gravite, lieux, occurrences }) =>
        [code, gravite, lieux, occurrences].join(';'),
      ),
    ].join('\n'),
    'utf8',
  )

  return [...ecrits, 'releve.csv'].sort()
}

export const dossierDuReleve = (): string => join(process.cwd(), DOSSIER)
