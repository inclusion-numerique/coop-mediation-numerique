import { mkdirSync, rmSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import type { ConsignerLesConfrontations } from '../domain/reprise-du-siret'

const DOSSIER = 'output/reprise-siret'

const FICHIER = 'confrontations.csv'

const cellule = (valeur: string): string =>
  `"${valeur.replaceAll('"', '""').replaceAll('\n', ' ')}"`

export const consignerLesConfrontations: ConsignerLesConfrontations = async (
  confrontations,
) => {
  const [premiere] = confrontations

  if (premiere == null) return

  const dossier = join(process.cwd(), DOSSIER)
  const colonnes = Object.keys(premiere)

  rmSync(dossier, { recursive: true, force: true })
  mkdirSync(dossier, { recursive: true })
  writeFileSync(
    join(dossier, FICHIER),
    `${[
      colonnes.join(';'),
      ...confrontations.map((ligne) =>
        colonnes.map((colonne) => cellule(ligne[colonne] ?? '')).join(';'),
      ),
    ].join('\n')}\n`,
    'utf8',
  )
}
