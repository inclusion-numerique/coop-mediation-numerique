export const lue = <T>(
  constructeur: { safe: (valeur: string) => T | null },
  valeur: string | null,
): T | null => (valeur === null ? null : constructeur.safe(valeur))
