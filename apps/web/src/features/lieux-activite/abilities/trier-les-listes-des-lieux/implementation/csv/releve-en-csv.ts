import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  type DeposerLeReleve,
  LISTES,
  type LieuDuReleve,
  type Releve,
} from '../../domain'

const DOSSIER = 'output/tri-des-listes'

const FICHIER = 'listes-a-trier.csv'

const A_TRIER = 'à trier'

const EN_TETE = [
  'lieu_id',
  'nom',
  'commune',
  'code_postal',
  'publie',
  ...LISTES,
]

const cellule = (valeur: string): string =>
  `"${valeur.replaceAll('"', '""').replaceAll('\n', ' ').replaceAll('\r', '')}"`

const ligneDuLieu = (lieu: LieuDuReleve): readonly string[] => [
  lieu.lieuId,
  cellule(lieu.nom),
  cellule(lieu.commune),
  lieu.codePostal,
  lieu.publie ? 'oui' : 'non',
  ...LISTES.map((liste) => (lieu.colonnes.includes(liste) ? A_TRIER : '')),
]

const enLignes = (releve: Releve): string =>
  [EN_TETE, ...releve.lieux.map(ligneDuLieu)]
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
