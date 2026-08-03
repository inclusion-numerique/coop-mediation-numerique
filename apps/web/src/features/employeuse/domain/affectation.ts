import type { Employeuse } from './employeuse'
import { prioriteSource, type SourceAffectation } from './source-affectation'

/**
 * Rattachement actif d'une personne à une employeuse
 * (`main.personne_affectations_emploi`, `est_active`). Une personne peut en
 * porter plusieurs simultanément — sources différentes, ou plusieurs employeurs
 * déclarés — d'où la règle d'arbitrage ci-dessous.
 */
export type Affectation = {
  readonly employeuse: Employeuse
  readonly source: SourceAffectation
  readonly depuis: Date | null
}

/**
 * L'affectation qui fait foi : la source la plus autoritaire, puis, à source
 * égale, la plus récemment enregistrée.
 */
export const affectationActuelle = (
  affectations: readonly Affectation[],
): Affectation | null =>
  affectations
    .toSorted((a, b) => {
      const parSource = prioriteSource[a.source] - prioriteSource[b.source]
      if (parSource !== 0) return parSource
      return (b.depuis?.getTime() ?? 0) - (a.depuis?.getTime() ?? 0)
    })
    .at(0) ?? null
