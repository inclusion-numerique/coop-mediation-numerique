import { isAfter, isBefore } from 'date-fns'
import { fromZonedTime } from 'date-fns-tz'

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

const debutDuJourAParis = (jour: Date): Date =>
  fromZonedTime(`${jour.toISOString().slice(0, 10)}T00:00:00`, 'Europe/Paris')

const rupturePassee = (contrat: Contrat, maintenant: Date): Date | null =>
  contrat.etat._tag === 'Rompu' &&
  !isAfter(debutDuJourAParis(contrat.etat.le), maintenant)
    ? contrat.etat.le
    : null

const estActif = (contrat: Contrat, maintenant: Date): boolean =>
  (contrat.debut == null || !isAfter(contrat.debut, maintenant)) &&
  rupturePassee(contrat, maintenant) == null

const derniereRupture = (
  contrats: readonly Contrat[],
  maintenant: Date,
): Date | null =>
  contrats
    .map((contrat) => rupturePassee(contrat, maintenant))
    .filter((rupture) => rupture != null)
    .toSorted((a, b) => b.getTime() - a.getTime())[0] ?? null

export const ruptureEnAttente = ({
  contrats,
  visibiliteChoisieLe,
  maintenant,
}: {
  readonly contrats: readonly Contrat[]
  readonly visibiliteChoisieLe: Date | null
  readonly maintenant: Date
}): RuptureEnAttente | null => {
  const rupture = derniereRupture(contrats, maintenant)

  return rupture != null &&
    !contrats.some((contrat) => estActif(contrat, maintenant)) &&
    (visibiliteChoisieLe == null ||
      isBefore(visibiliteChoisieLe, debutDuJourAParis(rupture)))
    ? { dateRupture: rupture }
    : null
}
