import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  type AnomalieSituee,
  LISTES,
  type Releve,
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

/**
 * Les postes qui portent sur les listes de vocabulaire se lisent en tableau :
 * une ligne par lieu, une colonne par liste, et « à trier » là où il y a
 * quelque chose à faire. Un lieu dont aucune liste ne bouge n'y figure pas —
 * un relevé énumère ce qu'il reste à faire, pas ce qui va bien.
 */
export const CODES_DE_LISTE = new Set(['liste-desordonnee', 'liste-en-doublon'])

const A_TRIER = 'à trier'

const enTableauDeListes = (detail: readonly AnomalieSituee[]): string => {
  const parLieu = new Map<
    string,
    { anomalie: AnomalieSituee; champs: Set<string> }
  >()

  for (const anomalie of detail) {
    const lieu = parLieu.get(anomalie.lieuId) ?? {
      anomalie,
      champs: new Set<string>(),
    }
    lieu.champs.add(anomalie.champ)
    parLieu.set(anomalie.lieuId, lieu)
  }

  const entete = [
    'lieu_id',
    'nom',
    'commune',
    'code_postal',
    'publie',
    ...LISTES,
  ].join(';')

  const lignes = [...parLieu.values()].map(({ anomalie, champs }) =>
    [
      anomalie.lieuId,
      cellule(anomalie.nom),
      cellule(anomalie.commune),
      anomalie.codePostal,
      anomalie.publie ? 'oui' : 'non',
      ...LISTES.map((liste) => (champs.has(liste) ? A_TRIER : '')),
    ].join(';'),
  )

  return [entete, ...lignes].join('\n')
}

export const releveEnCsv = (releve: Releve): readonly string[] => {
  const dossier = join(process.cwd(), DOSSIER)

  rmSync(dossier, { recursive: true, force: true })
  mkdirSync(dossier, { recursive: true })

  const ecrits = [...parCode(releve.detail).entries()].map(
    ([code, anomalies]) => {
      const chemin = join(dossier, `${code}.csv`)
      const contenu = CODES_DE_LISTE.has(code)
        ? enTableauDeListes(anomalies)
        : [ENTETE, ...anomalies.map(ligneCsv)].join('\n')

      writeFileSync(chemin, `${contenu}\n`, 'utf8')

      const lieux = new Set(anomalies.map(({ lieuId }) => lieuId)).size

      return `${code}.csv (${lieux} lieux)`
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
