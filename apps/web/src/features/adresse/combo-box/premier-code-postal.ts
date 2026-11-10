export const premierCodePostal = (codesPostaux: string): string =>
  codesPostaux.split(',')[0]?.trim() ?? codesPostaux
