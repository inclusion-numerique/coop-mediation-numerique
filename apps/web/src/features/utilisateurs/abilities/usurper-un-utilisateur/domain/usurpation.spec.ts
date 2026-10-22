import {
  NomAffiche,
  OrigineCompte,
  RoleUtilisateur,
  UtilisateurId,
} from '@app/web/features/utilisateurs/domain'
import {
  autoriserUsurpation,
  type CibleUsurpation,
  PorteeUsurpation,
} from './usurpation'

const cible = (origine: 'Reel' | 'Fixture'): CibleUsurpation => ({
  id: UtilisateurId('0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f'),
  nom: NomAffiche('Jeanne Martin'),
  origine: OrigineCompte(origine),
  role: RoleUtilisateur('User'),
  inscritLe: null,
  rattachements: { _tag: 'aucun' },
})

describe('autoriser une usurpation', () => {
  it('autorise toujours un compte de test', () => {
    expect(
      autoriserUsurpation(
        cible('Fixture'),
        PorteeUsurpation('FixturesSeulement'),
      ).success,
    ).toBe(true)
  })

  it('refuse un compte réel tant que la portée se limite aux fixtures', () => {
    expect(
      autoriserUsurpation(cible('Reel'), PorteeUsurpation('FixturesSeulement')),
    ).toEqual({
      success: false,
      error: { _tag: 'UsurpationHorsFixtures' },
    })
  })

  it('autorise un compte réel quand la portée couvre tous les comptes', () => {
    expect(
      autoriserUsurpation(cible('Reel'), PorteeUsurpation('TousLesComptes'))
        .success,
    ).toBe(true)
  })
})
