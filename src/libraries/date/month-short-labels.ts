const monthShortLabels = [
  'Jan.',
  'Fév.',
  'Mars',
  'Avr.',
  'Mai',
  'Juin',
  'Juil.',
  'Août',
  'Sep.',
  'Oct.',
  'Nov.',
  'Déc.',
] as const

export const libelleCourtDuMois = (numero: number): string =>
  monthShortLabels[numero - 1] ?? String(numero)
