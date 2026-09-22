import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  type DeposerLeReleve,
  type LieuAuReleve,
  mentionsDuLieu,
  type Releve,
} from '../../domain'

const DOSSIER = 'output/reprise-lieux'

const FICHIER = 'reprise-lieux.csv'

const EN_TETE_IDENTITE = ['lieu_id', 'nom', 'commune', 'code_postal', 'publie']

const cellule = (valeur: string): string =>
  valeur === ''
    ? ''
    : `"${valeur.replaceAll('"', '""').replaceAll('\n', ' ').replaceAll('\r', '')}"`

const parColonne = (lieu: LieuAuReleve): ReadonlyMap<string, string> =>
  new Map(
    mentionsDuLieu(lieu).map(({ colonne, cellule }) => [colonne, cellule]),
  )

const ligneDuLieu =
  (colonnes: readonly string[]) =>
  (lieu: LieuAuReleve): readonly string[] => {
    const mentions = parColonne(lieu)

    return [
      lieu.lieuId,
      cellule(lieu.nom),
      cellule(lieu.commune),
      lieu.codePostal,
      lieu.publie ? 'oui' : 'non',
      ...colonnes.map((colonne) => cellule(mentions.get(colonne) ?? '')),
    ]
  }

const enLignes = (releve: Releve): string =>
  [
    [...EN_TETE_IDENTITE, ...releve.colonnes],
    ...releve.lieux.map(ligneDuLieu(releve.colonnes)),
  ]
    .map((ligne) => ligne.join(';'))
    .join('\n')

const dossierNeuf = (): string => {
  const dossier = join(process.cwd(), DOSSIER)

  rmSync(dossier, { recursive: true, force: true })
  mkdirSync(dossier, { recursive: true })

  return dossier
}

export const deposerLeReleve: DeposerLeReleve = async (releve) => {
  writeFileSync(join(dossierNeuf(), FICHIER), `${enLignes(releve)}\n`, 'utf8')

  return [FICHIER]
}

export const dossierDuReleve = (): string => join(process.cwd(), DOSSIER)
