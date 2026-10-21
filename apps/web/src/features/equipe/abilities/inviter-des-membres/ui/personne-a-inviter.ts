import type { Email } from '../../../domain'
import type { MediateurAInviter } from '../domain'

export type PersonneAInviter =
  | ({ readonly _tag: 'Mediateur' } & MediateurAInviter)
  | { readonly _tag: 'Email'; readonly email: Email }

export const libelleDe = (personne: PersonneAInviter): string =>
  personne._tag === 'Mediateur' ? personne.nom : personne.email

export const cleDe = (personne: PersonneAInviter): Email => personne.email

const parmi =
  (personnes: readonly PersonneAInviter[]) => (personne: PersonneAInviter) =>
    personnes.some((autre) => cleDe(autre) === cleDe(personne))

export const ajouter = (
  membres: readonly PersonneAInviter[],
  personne: PersonneAInviter,
): readonly PersonneAInviter[] =>
  parmi(membres)(personne) ? membres : [...membres, personne]

export const horsDe =
  (personnes: readonly PersonneAInviter[]) => (personne: PersonneAInviter) =>
    !parmi(personnes)(personne)
