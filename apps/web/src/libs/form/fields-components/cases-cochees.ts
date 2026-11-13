export const casesCochees = <T>(
  cochees: readonly T[],
  cochee: T,
  exclusives: readonly T[],
): T[] =>
  exclusives.includes(cochee)
    ? [cochee]
    : [...cochees.filter((valeur) => !exclusives.includes(valeur)), cochee]
