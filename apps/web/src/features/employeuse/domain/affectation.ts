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

/**
 * La personne relève-t-elle du dispositif conseiller numérique ?
 *
 * La règle est une affectation `idposte` ACTIVE : c'est l'Entrepôt qui la pose et la retire, et
 * c'est elle — pas `main.poste`, pas `conseiller_numerique_id` — qui suit le contrat. Les deux
 * autres pistes ont été mesurées et divergent bien davantage.
 *
 * Le corollaire tient en une phrase : la fin d'un contrat conum se lit ici, immédiatement, au lieu
 * d'attendre qu'une synchro nocturne veuille bien recopier un drapeau.
 */
export const estConseillerNumerique = (
  // Seuls la source et l'état comptent : la règle accepte donc une projection minimale, ce qui évite
  // de charger structures et contrats là où on ne veut qu'un booléen.
  affectations: readonly Pick<Affectation, 'source' | 'active'>[],
): boolean =>
  affectations.some(
    (affectation) => affectation.active && affectation.source === 'idposte',
  )
