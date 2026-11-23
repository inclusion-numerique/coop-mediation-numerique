import type { ParametresDesCoordinations } from '../../../domain'

export const parametresDeLaRecherche = (
  recherche: URLSearchParams,
): ParametresDesCoordinations => ({
  du: recherche.get('du') ?? undefined,
  au: recherche.get('au') ?? undefined,
  types: recherche.get('types') ?? undefined,
  tags: recherche.get('tags') ?? undefined,
})
