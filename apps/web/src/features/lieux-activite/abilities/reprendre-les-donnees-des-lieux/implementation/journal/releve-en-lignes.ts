import {
  comptesDesHoraires,
  comptesParColonne,
  type Releve,
} from '../../domain'

const LARGEUR_COLONNE = 30

const listes = (releve: Releve): readonly string[] => {
  const colonnes = comptesParColonne(releve)

  if (colonnes.length === 0) return []

  return [
    '',
    'listes à trier, colonne par colonne :',
    ...colonnes.map(
      ({ colonne, lieux }) =>
        `  ${colonne.padEnd(LARGEUR_COLONNE)} ${String(lieux).padStart(6)}`,
    ),
  ]
}

const horaires = (releve: Releve): readonly string[] => {
  const { aCorriger, aEffacer } = comptesDesHoraires(releve)

  if (aCorriger === 0 && aEffacer === 0) return []

  return [
    '',
    'horaires :',
    `  ${'à corriger'.padEnd(LARGEUR_COLONNE)} ${String(aCorriger).padStart(6)}`,
    `  ${'à effacer'.padEnd(LARGEUR_COLONNE)} ${String(aEffacer).padStart(6)}`,
  ]
}

export const releveEnLignes = (releve: Releve): readonly string[] => [
  `lieux mesurés        ${releve.lieuxMesures}`,
  `lieux à reprendre    ${releve.lieux.length}`,
  ...listes(releve),
  ...horaires(releve),
]
