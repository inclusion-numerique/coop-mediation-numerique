export const enErreur = (erreur: unknown): Error =>
  erreur instanceof Error ? erreur : new Error(String(erreur))
