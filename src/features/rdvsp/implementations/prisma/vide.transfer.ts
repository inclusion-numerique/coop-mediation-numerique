export const absentSiVide = (valeur: string | null): string | null =>
  valeur === null || valeur.trim() === '' ? null : valeur
