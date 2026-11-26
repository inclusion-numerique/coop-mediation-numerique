import { z } from 'zod'
import type {
  Jalon,
  NomAffiche,
  OrigineCompte,
  RattachementsDuCompte,
  RoleUtilisateur,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { defineModel, type Model } from '@/libraries/model'
import { failure, type Result, success } from '@/libraries/result'
import { UsurpationHorsFixtures } from './errors'

export const PorteeUsurpation = defineModel(
  z.enum(['FixturesSeulement', 'TousLesComptes']).brand('PorteeUsurpation'),
)

export type PorteeUsurpation = Model.TypeOf<typeof PorteeUsurpation>

export type CibleUsurpation = {
  readonly id: UtilisateurId
  readonly nom: NomAffiche
  readonly origine: OrigineCompte
  readonly role: RoleUtilisateur
  readonly inscription: Jalon
  readonly rattachements: RattachementsDuCompte
}

export type CompteDeTest = {
  readonly id: UtilisateurId
  readonly nom: NomAffiche
}

export type UsurpationOuverte = {
  readonly jetonDeSession: string
  readonly cible: CibleUsurpation
  readonly usurpateurId: string
}

export const autoriserUsurpation = (
  cible: CibleUsurpation,
  portee: PorteeUsurpation,
): Result<CibleUsurpation, UsurpationHorsFixtures> =>
  portee === 'TousLesComptes' || cible.origine === 'Fixture'
    ? success(cible)
    : failure(UsurpationHorsFixtures())
