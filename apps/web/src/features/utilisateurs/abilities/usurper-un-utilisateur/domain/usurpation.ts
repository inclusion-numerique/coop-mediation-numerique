import type {
  OrigineCompte,
  RattachementsDuCompte,
  RoleUtilisateur,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import { defineModel, type Model } from '@app/web/libraries/model'
import { failure, type Result, success } from '@app/web/libraries/result'
import { z } from 'zod'

export const PorteeUsurpation = defineModel(
  z.enum(['FixturesSeulement', 'TousLesComptes']).brand('PorteeUsurpation'),
)

export type PorteeUsurpation = Model.TypeOf<typeof PorteeUsurpation>

export type CibleUsurpation = {
  readonly id: UtilisateurId
  readonly nom: string
  readonly origine: OrigineCompte
  readonly role: RoleUtilisateur
  readonly inscritLe: Date | null
  readonly rattachements: RattachementsDuCompte
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
