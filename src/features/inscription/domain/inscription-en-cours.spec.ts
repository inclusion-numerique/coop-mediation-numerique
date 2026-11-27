import { describe, expect, it } from 'vitest'
import { inscriptionEnCours, type RoleDuCompte } from './inscription-en-cours'

describe('inscriptionEnCours', () => {
  it.each<{
    cas: string
    utilisateur:
      | {
          role: RoleDuCompte
          inscriptionValidee: string | Date | null
        }
      | undefined
    attendu: boolean
  }>([
    {
      cas: 'sans utilisateur, aucune inscription n’est en cours',
      utilisateur: undefined,
      attendu: false,
    },
    {
      cas: 'un utilisateur sans validation a son inscription en cours',
      utilisateur: { role: 'User', inscriptionValidee: null },
      attendu: true,
    },
    {
      cas: 'un utilisateur validé n’a plus d’inscription en cours',
      utilisateur: {
        role: 'User',
        inscriptionValidee: new Date('2026-07-16T10:00:00.000Z'),
      },
      attendu: false,
    },
    {
      cas: 'un utilisateur validé par une date sérialisée n’a plus d’inscription en cours',
      utilisateur: {
        role: 'User',
        inscriptionValidee: '2026-07-16T10:00:00.000Z',
      },
      attendu: false,
    },
    {
      cas: 'un administrateur sans validation n’a pas d’inscription en cours',
      utilisateur: { role: 'Admin', inscriptionValidee: null },
      attendu: false,
    },
  ])('$cas', ({ utilisateur, attendu }) => {
    expect(inscriptionEnCours(utilisateur)).toBe(attendu)
  })
})
