import type { AuteurId } from '@app/web/features/utilisateurs/domain'
import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

/**
 * Couloirs automatiques qui suppriment un compte.
 *
 * Une seule valeur aujourd'hui : le couloir « inscrit mais jamais actif », qui
 * anonymise à J+105. Le couloir « inscription jamais terminée » fait un DELETE
 * physique et ne passe donc pas par ici.
 */
export const couloirsAutomatiques = ['InscritJamaisActif'] as const

export const CouloirAutomatique = defineModel(
  z.enum(couloirsAutomatiques).brand('CouloirAutomatique'),
)
export type CouloirAutomatique = Model.TypeOf<typeof CouloirAutomatique>

/** Qui demande l'effacement. Trois chemins, une seule charge. */
export type AuteurSuppression =
  | { readonly _tag: 'titulaire' }
  | { readonly _tag: 'administrateur'; readonly administrateurId: AuteurId }
  | { readonly _tag: 'systeme'; readonly couloir: CouloirAutomatique }
