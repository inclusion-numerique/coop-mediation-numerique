import { failure, type Result, success } from '@app/web/libraries/result'
import { AucunChoix, ChoixEnDouble } from './errors'
import type { Precision } from './precision'

export type Choix<Valeur> =
  | { readonly _tag: 'Liste'; readonly valeur: Valeur }
  | { readonly _tag: 'Autre'; readonly precision: Precision }

export type ChoixMultiples<Valeur> = {
  readonly valeurs: readonly Valeur[]
  readonly autre: Precision | null
}

export const choixMultiplesDe = <Valeur>(
  choix: ChoixMultiples<Valeur>,
): Result<ChoixMultiples<Valeur>, AucunChoix | ChoixEnDouble> => {
  if (choix.valeurs.length === 0 && choix.autre === null) {
    return failure(AucunChoix())
  }
  return new Set(choix.valeurs).size === choix.valeurs.length
    ? success(choix)
    : failure(ChoixEnDouble())
}
