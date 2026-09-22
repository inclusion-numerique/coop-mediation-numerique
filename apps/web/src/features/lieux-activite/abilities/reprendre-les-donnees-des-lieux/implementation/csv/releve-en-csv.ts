import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  type DeposerLeReleve,
  type HorairesAReprendre,
  LISTES,
  type LieuAuReleve,
  type Releve,
} from '../../domain'

const DOSSIER = 'output/reprise-lieux'

const FICHIER = 'reprise-lieux.csv'

const A_TRIER = 'à trier'

const A_CORRIGER = 'à corriger'

const A_DEPLACER = 'À déplacer dans le champ description'

const EN_TETE = [
  'lieu_id',
  'nom',
  'commune',
  'code_postal',
  'publie',
  ...LISTES,
  'horaires',
]

const cellule = (valeur: string): string =>
  `"${valeur.replaceAll('"', '""').replaceAll('\n', ' ').replaceAll('\r', '')}"`

const celluleDesHoraires = (horaires: HorairesAReprendre | null): string =>
  horaires == null
    ? ''
    : horaires.verdict === 'a-corriger'
      ? A_CORRIGER
      : A_DEPLACER

const ligneDuLieu = (lieu: LieuAuReleve): readonly string[] => [
  lieu.lieuId,
  cellule(lieu.nom),
  cellule(lieu.commune),
  lieu.codePostal,
  lieu.publie ? 'oui' : 'non',
  ...LISTES.map((liste) => (lieu.listesATrier.includes(liste) ? A_TRIER : '')),
  celluleDesHoraires(lieu.horaires),
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
