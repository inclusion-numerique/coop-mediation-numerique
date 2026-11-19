import type { Employeuse } from './employeuse'
import { prioriteSource, type SourceAffectation } from './source-affectation'

/**
 * Rattachement d'une personne à une employeuse
 * (`main.personne_affectations_emploi`). Une personne peut en porter plusieurs
 * simultanément — sources différentes, ou plusieurs employeurs déclarés — d'où
 * la règle d'arbitrage ci-dessous.
 *
 * `active` porte le `est_active` de la base : les affectations passées restent
 * en base et servent l'historique. Le fait que seules les actives désignent
 * l'employeuse courante est une règle du domaine, pas un filtre caché dans un
 * `select`.
 */
export type Affectation = {
  readonly employeuse: Employeuse
  readonly source: SourceAffectation
  readonly active: boolean
  readonly depuis: Date | null
}

/**
 * L'affectation qui fait foi : parmi les actives, la source la plus
 * autoritaire, puis, à source égale, la plus récemment enregistrée.
 */
export const affectationActuelle = (
  affectations: readonly Affectation[],
): Affectation | null =>
  affectations
    .filter((affectation) => affectation.active)
    .toSorted((a, b) => {
      const parSource = prioriteSource[a.source] - prioriteSource[b.source]
      if (parSource !== 0) return parSource
      return (b.depuis?.getTime() ?? 0) - (a.depuis?.getTime() ?? 0)
    })
    .at(0) ?? null
