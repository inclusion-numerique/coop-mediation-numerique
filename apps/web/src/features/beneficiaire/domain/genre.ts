export const genres = [
  'Masculin',
  'Feminin',
  'NonCommunique',
] as const

export type Genre = (typeof genres)[number]

export const genreLabels: Record<Genre, string> = {
  Masculin: 'Masculin',
  Feminin: 'Féminin',
  NonCommunique: 'Non communiqué',
}

export const sexLabels: Record<Genre, string> = {
  Masculin: 'Homme',
  Feminin: 'Femme',
  NonCommunique: 'Non communiqué',
}
