import { describe, expect, it } from 'vitest'
import { utilisateurDuPartage } from './utilisateur-du-partage.transfer'

const personne = {
  id: 'utilisateur-1',
  coordinateur: { id: 'coordinateur-1' },
  emplois: [{ id: 'emploi-1' }],
  rdvAccount: { id: 42 },
}

describe('utilisateur vu à travers un partage de statistiques', () => {
  it('garde la coordination quand le propriétaire du partage est coordinateur, sans emplois ni compte RDV', () => {
    expect(utilisateurDuPartage({ _tag: 'Coordinateur' }, personne)).toEqual({
      id: 'utilisateur-1',
      coordinateur: { id: 'coordinateur-1' },
      emplois: [],
      rdvAccount: null,
    })
  })

  it('retire la coordination quand le propriétaire du partage est médiateur', () => {
    expect(utilisateurDuPartage({ _tag: 'Mediateur' }, personne)).toEqual({
      id: 'utilisateur-1',
      coordinateur: null,
      emplois: [],
      rdvAccount: null,
    })
  })
})
