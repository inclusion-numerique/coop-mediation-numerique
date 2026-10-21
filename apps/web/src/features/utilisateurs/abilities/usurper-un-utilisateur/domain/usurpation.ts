import type {
  OrigineCompte,
  RoleUtilisateur,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { failure, type Result, success } from '@app/web/libraries/result'

export type PorteeUsurpation = 'FixturesSeulement' | 'TousLesComptes'

export type CibleUsurpation = {
  readonly id: UtilisateurId
  readonly nom: string
  readonly origine: OrigineCompte
  readonly role: RoleUtilisateur
  readonly inscritLe: Date | null
  readonly mediateurId: string | null
  readonly coordinateurId: string | null
}

export type UsurpationHorsFixtures = { readonly _tag: 'UsurpationHorsFixtures' }

export const UsurpationHorsFixtures = (): UsurpationHorsFixtures => ({
  _tag: 'UsurpationHorsFixtures',
})

export const autoriserUsurpation = (
  cible: CibleUsurpation,
  portee: PorteeUsurpation,
): Result<CibleUsurpation, UsurpationHorsFixtures> =>
  portee === 'TousLesComptes' || cible.origine === 'Fixture'
    ? success(cible)
    : failure(UsurpationHorsFixtures())
