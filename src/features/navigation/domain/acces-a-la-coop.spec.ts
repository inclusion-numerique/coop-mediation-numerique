import { describe, expect, it } from 'vitest'
import { accesALaCoop } from './acces-a-la-coop'

describe('accès à la coop', () => {
  it('réserve la coop aux utilisateurs face à un administrateur', () => {
    expect(accesALaCoop({ role: 'Admin', inscriptionAchevee: true })).toEqual({
      _tag: 'ReserveAuxUtilisateurs',
      role: 'Admin',
    })
  })

  it('réserve la coop aux utilisateurs face au support, même sans inscription', () => {
    expect(
      accesALaCoop({ role: 'Support', inscriptionAchevee: false }),
    ).toEqual({ _tag: 'ReserveAuxUtilisateurs', role: 'Support' })
  })

  it('renvoie à l’inscription un utilisateur qui ne l’a pas achevée', () => {
    expect(accesALaCoop({ role: 'User', inscriptionAchevee: false })).toEqual({
      _tag: 'InscriptionInachevee',
    })
  })

  it('ouvre la coop à un utilisateur inscrit', () => {
    expect(accesALaCoop({ role: 'User', inscriptionAchevee: true })).toEqual({
      _tag: 'Ouvert',
    })
  })
})
