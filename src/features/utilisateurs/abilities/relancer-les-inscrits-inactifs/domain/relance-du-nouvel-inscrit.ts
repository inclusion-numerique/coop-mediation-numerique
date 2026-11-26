import type { PalierDeRelance } from '@/features/utilisateurs/domain'

export type RelanceDuNouvelInscrit =
  | { readonly _tag: 'BienDemarrer'; readonly palier: PalierDeRelance }
  | {
      readonly _tag: 'RelanceDuCompte'
      readonly palier: PalierDeRelance
      readonly moisDepuisLInscription: 1 | 2
    }

export const relanceDuNouvelInscrit = (
  palier: PalierDeRelance,
): RelanceDuNouvelInscrit => {
  if (palier === 7) return { _tag: 'BienDemarrer', palier }
  return {
    _tag: 'RelanceDuCompte',
    palier,
    moisDepuisLInscription: palier === 30 ? 1 : 2,
  }
}
