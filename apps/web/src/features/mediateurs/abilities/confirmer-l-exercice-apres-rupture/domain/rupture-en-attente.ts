import { isAfter, isBefore } from 'date-fns'

export type EtatContrat =
  | { readonly _tag: 'EnCours' }
  | { readonly _tag: 'Rompu'; readonly le: Date }

export type Contrat = {
  readonly debut: Date | null
  readonly etat: EtatContrat
}

export type RuptureEnAttente = {
  readonly dateRupture: Date
}

export const etatContrat = (rupture: Date | null): EtatContrat =>
  rupture == null ? { _tag: 'EnCours' } : { _tag: 'Rompu', le: rupture }

const plusRecent = (contrats: readonly Contrat[]): Contrat | null =>
  contrats.toSorted(
    (a, b) => (b.debut?.getTime() ?? 0) - (a.debut?.getTime() ?? 0),
  )[0] ?? null

export const ruptureEnAttente = ({
  contrats,
  derniereModification,
  maintenant,
}: {
  readonly contrats: readonly Contrat[]
  readonly derniereModification: Date
  readonly maintenant: Date
}): RuptureEnAttente | null => {
  const etat = plusRecent(contrats)?.etat

  return etat?._tag === 'Rompu' &&
    isBefore(etat.le, maintenant) &&
    isAfter(etat.le, derniereModification)
    ? { dateRupture: etat.le }
    : null
}
