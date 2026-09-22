import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import {
  type DeposerLeReleve,
  LISTES,
  type LieuAuxListesATrier,
  type ListesATrier,
} from '../../domain'

const DOSSIER = 'output/reprise-lieux'

const LISTES_A_TRIER = 'listes-a-trier.csv'

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

const ligneDuLieu = (lieu: LieuAuxListesATrier): readonly string[] => [
  lieu.lieuId,
  cellule(lieu.nom),
  cellule(lieu.commune),
  lieu.codePostal,
  lieu.publie ? 'oui' : 'non',
  ...LISTES.map((liste) => (lieu.colonnes.includes(liste) ? A_TRIER : '')),
]

const enLignes = (listesATrier: ListesATrier): string =>
  [EN_TETE, ...listesATrier.lieux.map(ligneDuLieu)]
    .map((ligne) => ligne.join(';'))
    .join('\n')

const dossierNeuf = (): string => {
  const dossier = join(process.cwd(), DOSSIER)

  rmSync(dossier, { recursive: true, force: true })
  mkdirSync(dossier, { recursive: true })

  return dossier
}

const ecrire = (dossier: string, nom: string, contenu: string): string => {
  writeFileSync(join(dossier, nom), `${contenu}\n`, 'utf8')

  return nom
}

export const deposerLeReleve: DeposerLeReleve = async (releve) => {
  const dossier = dossierNeuf()

  return [ecrire(dossier, LISTES_A_TRIER, enLignes(releve.listesATrier))]
}

export const dossierDuReleve = (): string => join(process.cwd(), DOSSIER)
