import { describe, expect, it } from 'vitest'
import {
  type CoordinateurId,
  JAMAIS,
  type MediateurId,
  NomAffiche,
  OrigineCompte,
  RoleUtilisateur,
  rattachements,
  UtilisateurId,
} from '@/features/utilisateurs/domain'
import { type CibleUsurpation, PorteeUsurpation } from './usurpation'
import { usurperUnUtilisateur } from './usurper-un-utilisateur'

const utilisateurId = UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f')
const usurpateurId = UtilisateurId('1c2d3e4f-5a6b-4c7d-8e9f-0a1b2c3d4e5f')

const cible = (origine: OrigineCompte): CibleUsurpation => ({
  id: utilisateurId,
  nom: NomAffiche('Jeanne Martin'),
  origine,
  role: RoleUtilisateur('User'),
  inscription: JAMAIS,
  rattachements: rattachements<MediateurId, CoordinateurId>(null, null),
})

const fixture = cible(OrigineCompte('Fixture'))
const reel = cible(OrigineCompte('Reel'))

const usurpation = (cibleLue: CibleUsurpation | null) =>
  usurperUnUtilisateur({
    lireLaCible: async () => cibleLue,
    ouvrirLUsurpation: async () => undefined,
  })

const usurper = (cibleLue: CibleUsurpation | null, portee: PorteeUsurpation) =>
  usurpation(cibleLue)({
    utilisateurId,
    usurpateurId,
    jetonDeSession: 'jeton',
    portee,
  })

describe('usurper un utilisateur', () => {
  it('ouvre toujours l’usurpation d’un compte de test', async () => {
    expect(
      await usurper(fixture, PorteeUsurpation('FixturesSeulement')),
    ).toEqual({
      success: true,
      data: { jetonDeSession: 'jeton', cible: fixture, usurpateurId },
    })
  })

  it('ouvre l’usurpation d’un compte réel quand la portée couvre tous les comptes', async () => {
    expect(await usurper(reel, PorteeUsurpation('TousLesComptes'))).toEqual({
      success: true,
      data: { jetonDeSession: 'jeton', cible: reel, usurpateurId },
    })
  })

  it('refuse un compte réel tant que la portée se limite aux fixtures', async () => {
    expect(await usurper(reel, PorteeUsurpation('FixturesSeulement'))).toEqual({
      success: false,
      error: { _tag: 'UsurpationHorsFixtures' },
    })
  })

  it('signale un identifiant qui ne désigne aucun compte', async () => {
    expect(
      await usurpation(fixture)({
        utilisateurId: null,
        usurpateurId,
        jetonDeSession: 'jeton',
        portee: PorteeUsurpation('TousLesComptes'),
      }),
    ).toEqual({
      success: false,
      error: { _tag: 'UtilisateurIntrouvable' },
    })
  })

  it('signale un utilisateur introuvable', async () => {
    expect(await usurper(null, PorteeUsurpation('TousLesComptes'))).toEqual({
      success: false,
      error: { _tag: 'UtilisateurIntrouvable' },
    })
  })
})
