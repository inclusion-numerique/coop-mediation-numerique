import { comptesParMotif, type Releve } from '../../domain'

const LARGEUR_MOTIF = 40

export const releveEnLignes = (releve: Releve): readonly string[] => [
  `lieux mesurés        ${releve.lieuxMesures}`,
  `lieux à reprendre    ${releve.lieux.length}`,
  ...(releve.lieux.length === 0 ? [] : ['', 'motif par motif :']),
  ...comptesParMotif(releve).map(
    ({ motif, lieux }) =>
      `  ${motif.padEnd(LARGEUR_MOTIF)} ${String(lieux).padStart(6)}`,
  ),
]
