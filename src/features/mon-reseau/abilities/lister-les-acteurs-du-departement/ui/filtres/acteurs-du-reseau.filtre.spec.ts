import { describe, expect, it } from 'vitest'
import { estFiltre } from '../../domain'
import { criteresDesActeursDuReseau } from './acteurs-du-reseau.filtre'

describe('critères de l’annuaire des acteurs', () => {
  it('garde les critères valides', () => {
    expect(
      criteresDesActeursDuReseau({
        recherche: ' martin ',
        role: 'coordinateur',
        communes: '15014,abc',
        tri: 'nomza',
        page: '2',
        lignes: '50',
      }),
    ).toEqual({
      recherche: 'martin',
      role: 'coordinateur',
      communes: ['15014'],
      tri: 'nomza',
      page: 2,
      lignes: 50,
    })
  })

  it('écarte un rôle inconnu et se replie sur le tri alphabétique', () => {
    expect(
      criteresDesActeursDuReseau({ role: 'administrateur', tri: 'age' }),
    ).toEqual({
      recherche: null,
      role: null,
      communes: [],
      tri: 'nomaz',
      page: 1,
      lignes: 20,
    })
  })

  it('est filtré par une recherche, un rôle ou des communes', () => {
    expect(
      estFiltre(criteresDesActeursDuReseau({ page: '2', tri: 'nomza' })),
    ).toBe(false)
    expect(
      estFiltre(criteresDesActeursDuReseau({ role: 'coordinateur' })),
    ).toBe(true)
  })

  it('lit des communes passées en paramètres répétés', () => {
    expect(
      criteresDesActeursDuReseau({ communes: ['15014', '15187'] }).communes,
    ).toEqual(['15014', '15187'])
  })
})
