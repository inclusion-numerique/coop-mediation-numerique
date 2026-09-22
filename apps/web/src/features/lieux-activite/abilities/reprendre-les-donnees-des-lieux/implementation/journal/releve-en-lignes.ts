import type { Releve } from '../../domain'

const LARGEUR_COLONNE = 30

export const releveEnLignes = ({
  lieuxMesures,
  listesATrier,
}: Releve): readonly string[] => [
  `lieux mesurés        ${lieuxMesures}`,
  `listes à trier sur   ${listesATrier.lieux.length} lieux`,
  '',
  'lieux concernés, colonne par colonne :',
  ...listesATrier.colonnes.map(
    ({ colonne, lieux }) =>
      `  ${colonne.padEnd(LARGEUR_COLONNE)} ${String(lieux).padStart(6)}`,
  ),
]
