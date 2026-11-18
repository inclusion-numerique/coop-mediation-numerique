import type { Email } from '../../../domain/email'
import type { MediateurId } from '../../../domain/mediateur-id'
import type { Nom } from '../../../domain/nom'
import type { NomAffiche } from '../../../domain/nom-affiche'
import type { Prenom } from '../../../domain/prenom'

export type SituationDuMembre = 'Demandeur' | 'Membre' | 'AncienMembre'

export type MembreAFiltrer = {
  readonly mediateurId: MediateurId
  readonly nom: NomAffiche
  readonly email: Email
  readonly situation: SituationDuMembre
}

export type MembreLu = {
  readonly membre: Omit<MembreAFiltrer, 'situation'>
  readonly prenom: Prenom | null
  readonly nomDeFamille: Nom | null
  readonly departs: readonly (Date | null)[]
}

export const situationDe = (
  departs: readonly (Date | null)[],
): SituationDuMembre =>
  departs.length > 0 && departs.every((depart) => depart !== null)
    ? 'AncienMembre'
    : 'Membre'

const enMinuscules = (valeur: Prenom | Nom | null): string =>
  (valeur ?? '').toLowerCase()

const parNom = (a: MembreLu, b: MembreLu): number =>
  enMinuscules(a.nomDeFamille).localeCompare(enMinuscules(b.nomDeFamille)) ||
  enMinuscules(a.prenom).localeCompare(enMinuscules(b.prenom))

export const membresDansLOrdre = (
  demandeur: Omit<MembreAFiltrer, 'situation'> | null,
  membres: readonly MembreLu[],
): readonly MembreAFiltrer[] => {
  const ranges = [...membres].sort(parNom).map(({ membre, departs }) => ({
    ...membre,
    situation: situationDe(departs),
  }))
  const enTete: readonly MembreAFiltrer[] =
    demandeur === null ? [] : [{ ...demandeur, situation: 'Demandeur' }]
  return [
    ...enTete,
    ...ranges.filter(({ situation }) => situation === 'Membre'),
    ...ranges.filter(({ situation }) => situation === 'AncienMembre'),
  ]
}
