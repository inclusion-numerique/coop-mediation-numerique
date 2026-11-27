export const lue = <T>(
  constructeur: { safe: (valeur: string) => T | null },
  valeur: string | null,
): T | null => (valeur === null ? null : constructeur.safe(valeur))

export const facultative = <T>(
  constructeur: (valeur: string) => T,
  valeur: string | null,
): T | null => (valeur === null ? null : constructeur(valeur))
