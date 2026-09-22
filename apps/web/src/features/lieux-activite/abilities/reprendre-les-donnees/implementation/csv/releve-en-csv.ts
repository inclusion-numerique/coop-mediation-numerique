import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  type AnomalieSituee,
  type DeposerLeReleve,
  LISTES,
  parCode,
  parLieu,
  type Releve,
} from '../../domain'

const DOSSIER = 'output/reprise-lieux'

const CODES_DE_LISTE: ReadonlySet<string> = new Set(['liste-desordonnee'])

const A_RANGER = 'à ranger'

const EN_TETE_IDENTITE = ['lieu_id', 'nom', 'commune', 'code_postal', 'publie']

const cellule = (valeur: string): string =>
  `"${valeur.replaceAll('"', '""').replaceAll('\n', ' ').replaceAll('\r', '')}"`

const identite = (anomalie: AnomalieSituee): readonly string[] => [
  anomalie.lieuId,
  cellule(anomalie.nom),
  cellule(anomalie.commune),
  anomalie.codePostal,
  anomalie.publie ? 'oui' : 'non',
]

const enLignes = (
  enTete: readonly string[],
  lignes: readonly (readonly string[])[],
): string => [enTete, ...lignes].map((ligne) => ligne.join(';')).join('\n')

const uneLigneParAnomalie = (anomalies: readonly AnomalieSituee[]): string =>
  enLignes(
    [...EN_TETE_IDENTITE, 'champ', 'valeur'],
    anomalies.map((anomalie) => [
      ...identite(anomalie),
      anomalie.champ,
      cellule(anomalie.valeur),
    ]),
  )

const colonnesTouchees = (
  anomalies: readonly AnomalieSituee[],
): ReadonlySet<string> => new Set(anomalies.map(({ champ }) => champ))

const ligneDuLieu = (
  duLieu: readonly AnomalieSituee[],
): readonly (readonly string[])[] => {
  const touchees = colonnesTouchees(duLieu)

  return duLieu
    .slice(0, 1)
    .map((anomalie) => [
      ...identite(anomalie),
      ...LISTES.map((liste) => (touchees.has(liste) ? A_RANGER : '')),
    ])
}

const uneLigneParLieu = (anomalies: readonly AnomalieSituee[]): string =>
  enLignes(
    [...EN_TETE_IDENTITE, ...LISTES],
    [...parLieu(anomalies).values()].flatMap(ligneDuLieu),
  )

const synthese = (releve: Releve): string =>
  enLignes(
    ['code', 'gravite', 'lieux', 'occurrences'],
    releve.postes.map(({ code, gravite, lieux, occurrences }) => [
      code,
      gravite,
      String(lieux),
      String(occurrences),
    ]),
  )

const ecrire = (dossier: string, nom: string, contenu: string): string => {
  writeFileSync(join(dossier, nom), `${contenu}\n`, 'utf8')

  return nom
}

const dossierNeuf = (): string => {
  const dossier = join(process.cwd(), DOSSIER)

  rmSync(dossier, { recursive: true, force: true })
  mkdirSync(dossier, { recursive: true })

  return dossier
}

export const deposerLeReleve: DeposerLeReleve = async (releve) => {
  const dossier = dossierNeuf()

  return [
    ...[...parCode(releve.anomalies)].map(([code, anomalies]) =>
      ecrire(
        dossier,
        `${code}.csv`,
        CODES_DE_LISTE.has(code)
          ? uneLigneParLieu(anomalies)
          : uneLigneParAnomalie(anomalies),
      ),
    ),
    ecrire(dossier, 'releve.csv', synthese(releve)),
  ].sort()
}

export const dossierDuReleve = (): string => join(process.cwd(), DOSSIER)
