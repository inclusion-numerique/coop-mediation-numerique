import type { SlugOutil, ValeurDeSlugOutil } from '../../domain'
import type { EmplacementsDeLaFiche } from '../pages/OutilPage'

export type FournisseursDEmplacements = {
  readonly [Slug in ValeurDeSlugOutil]?: () => Promise<EmplacementsDeLaFiche>
}

export const emplacementsDeLOutil = async (
  slug: SlugOutil,
  fournisseurs: FournisseursDEmplacements,
): Promise<EmplacementsDeLaFiche> => {
  const valeur: ValeurDeSlugOutil = slug
  return (await fournisseurs[valeur]?.()) ?? {}
}
