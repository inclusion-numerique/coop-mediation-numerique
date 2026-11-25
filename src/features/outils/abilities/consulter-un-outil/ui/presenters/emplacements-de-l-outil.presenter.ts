import type { ReactNode } from 'react'
import type { SlugOutil, ValeurDeSlugOutil } from '../../domain/index'

export type EmplacementsDeLaFiche = {
  readonly avis?: ReactNode
  readonly acces?: ReactNode
}

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
