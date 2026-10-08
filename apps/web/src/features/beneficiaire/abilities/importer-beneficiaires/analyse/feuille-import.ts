export type ValeurCellule = string | number | boolean | null

export type LigneImport = ReadonlyArray<ValeurCellule>

export type FeuilleImport = ReadonlyArray<LigneImport>

export const valeurCellule = (
  feuille: FeuilleImport,
  numeroLigne: number,
  numeroColonne: number,
): ValeurCellule => feuille[numeroLigne - 1]?.[numeroColonne - 1] ?? null
