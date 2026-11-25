export const premierCodePostal = (codes: string | null): string | null =>
  codes?.split(',').at(0)?.trim() ?? null
