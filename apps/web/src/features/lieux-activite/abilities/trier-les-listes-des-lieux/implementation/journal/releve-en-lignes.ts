import type { Releve } from '../../domain'

const LARGEUR_COLONNE = 30

export const releveEnLignes = (releve: Releve): readonly string[] => [
  `lieux mesurés        ${releve.lieuxMesures}`,
  `listes à trier sur   ${releve.lieux.length} lieux`,
  '',
  'lieux concernés, colonne par colonne :',
  ...releve.colonnes.map(
    ({ colonne, lieux }) =>
      `  ${colonne.padEnd(LARGEUR_COLONNE)} ${String(lieux).padStart(6)}`,
  ),
]
