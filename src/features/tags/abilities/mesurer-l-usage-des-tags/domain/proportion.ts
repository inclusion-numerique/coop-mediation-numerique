import { Effectif } from './effectif'
import { Pourcentage } from './pourcentage'

export type Proportion = {
  readonly effectif: Effectif
  readonly pourcentage: Pourcentage
}

export const proportion = (
  effectif: Effectif,
  ensemble: Effectif,
): Proportion => ({
  effectif,
  pourcentage: Pourcentage(
    ensemble === 0 ? 0 : Math.min(100, Math.round((effectif / ensemble) * 100)),
  ),
})
