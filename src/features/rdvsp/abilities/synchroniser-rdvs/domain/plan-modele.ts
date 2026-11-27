import type { BilanModele } from '../../../domain/compte/bilan-synchronisation'

export type PlanModele<T> = {
  readonly aCreer: readonly T[]
  readonly aMettreAJour: readonly T[]
  readonly inchanges: readonly T[]
}

export const planifierModele = <T, Id>({
  recus,
  connus,
  cle,
  modifie,
  dejaTraites,
}: {
  recus: readonly T[]
  connus: ReadonlyMap<Id, T>
  cle: (element: T) => Id
  modifie: (connu: T, recu: T) => boolean
  dejaTraites: ReadonlySet<Id>
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

export type { BilanModele } from '../../../domain/compte/bilan-synchronisation'
export {
  bilanVide,
  cumulerBilans,
} from '../../../domain/compte/bilan-synchronisation'

export const bilanDuPlan = <T>(plan: PlanModele<T>): BilanModele => ({
  noop: plan.inchanges.length,
  created: plan.aCreer.length,
  updated: plan.aMettreAJour.length,
  deleted: 0,
})
