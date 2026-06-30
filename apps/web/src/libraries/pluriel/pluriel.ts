const reglesPluriel = new Intl.PluralRules('fr')

/**
 * Accorde un mot (ou une expression) au nombre selon les règles du français,
 * via `Intl.PluralRules`. En français, 0 et 1 sont au singulier, 2 et plus au
 * pluriel. On fournit la forme complète de chaque cas : pas de « s » implicite,
 * ce qui gère aussi les irréguliers (cheval/chevaux) et les invariables
 * (prix/prix).
 */
export const pluriel = (
  nombre: number,
  singulier: string,
  pluriel: string,
): string => (reglesPluriel.select(nombre) === 'one' ? singulier : pluriel)
