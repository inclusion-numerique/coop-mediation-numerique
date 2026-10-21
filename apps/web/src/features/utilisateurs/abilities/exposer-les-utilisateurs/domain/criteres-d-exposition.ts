import { defineModel, type Model } from '@app/web/libraries/model'
import { z } from 'zod'

export const SelectionDesSupprimes = defineModel(
  z.enum(['Exclus', 'Seuls', 'Inclus']).brand('SelectionDesSupprimes'),
)

export type SelectionDesSupprimes = Model.TypeOf<typeof SelectionDesSupprimes>

export const SelectionDesConseillers = defineModel(
  z.enum(['Exclus', 'Seuls', 'Indifferent']).brand('SelectionDesConseillers'),
)

export type SelectionDesConseillers = Model.TypeOf<
  typeof SelectionDesConseillers
>

export type CriteresDExposition = {
  readonly supprimes: SelectionDesSupprimes
  readonly conseillersNumeriques: SelectionDesConseillers
  readonly identifiantsConseillerNumerique: readonly number[]
  readonly identifiantsDataspace: readonly number[]
}
