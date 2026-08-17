/**
 * Ce qu'il faut faire d'un lot d'éléments reçus, confronté à ce que La Coop
 * détient. La forme est la même pour les rendez-vous, les motifs, les lieux et
 * les usagers : seule la comparaison change.
 */
import type { BilanModele } from '../../../domain/bilan-synchronisation'

export type PlanModele<T> = {
  readonly aCreer: readonly T[]
  readonly aMettreAJour: readonly T[]
  readonly inchanges: readonly T[]
}

export const planVide = <T>(): PlanModele<T> => ({
  aCreer: [],
  aMettreAJour: [],
  inchanges: [],
})

/**
 * Déduplique par clé — un même motif ou un même lieu revient sur des dizaines de
 * rendez-vous — puis classe chaque élément.
 *
 * `dejaTraites` porte la mémoire des lots précédents : la synchronisation avance
 * par paquets, et rien ne sert de réécrire un motif déjà vu au paquet d'avant.
 */
export const planifierModele = <T, Id>({
  recus,
  connus,
  cle,
  modifie,
  dejaTraites = new Set<Id>(),
}: {
  recus: readonly T[]
  connus: ReadonlyMap<Id, T>
  cle: (element: T) => Id
  modifie: (connu: T, recu: T) => boolean
  dejaTraites?: ReadonlySet<Id>
}): PlanModele<T> => {
  const uniques = [
    ...recus
      .reduce((accumulateur, element) => {
        const identifiant = cle(element)
        return dejaTraites.has(identifiant)
          ? accumulateur
          : accumulateur.set(identifiant, element)
      }, new Map<Id, T>())
      .values(),
  ]

  return {
    aCreer: uniques.filter((element) => !connus.has(cle(element))),
    aMettreAJour: uniques.filter((element) => {
      const connu = connus.get(cle(element))
      return connu !== undefined && modifie(connu, element)
    }),
    inchanges: uniques.filter((element) => {
      const connu = connus.get(cle(element))
      return connu !== undefined && !modifie(connu, element)
    }),
  }
}

export type { BilanModele } from '../../../domain/bilan-synchronisation'
export {
  bilanVide,
  cumulerBilans,
} from '../../../domain/bilan-synchronisation'

export const bilanDuPlan = <T>(
  plan: PlanModele<T>,
  supprimes = 0,
): BilanModele => ({
  noop: plan.inchanges.length,
  created: plan.aCreer.length,
  updated: plan.aMettreAJour.length,
  deleted: supprimes,
})
