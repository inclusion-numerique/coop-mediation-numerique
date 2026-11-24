import { Page, PageSize, Search, Sort } from '@arckit/resultset'
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
        tri: 'nom',
        ordre: 'desc',
        page: '2',
        lignes: '50',
      }),
    ).toEqual({
      recherche: Search('martin'),
      role: 'coordinateur',
      communes: ['15014'],
      tri: Sort('nom', 'desc'),
      page: Page(2),
      pageSize: PageSize(50),
    })
  })

  it('écarte un rôle inconnu et se replie sur le tri alphabétique', () => {
    expect(
      criteresDesActeursDuReseau({ role: 'administrateur', tri: 'age' }),
    ).toEqual({
      recherche: Search(''),
      role: null,
      communes: [],
      tri: Sort('nom', 'asc'),
      page: Page(1),
      pageSize: PageSize(20),
    })
  })

  it('n’est pas filtré par la page ni le tri', () => {
    expect(
      estFiltre(criteresDesActeursDuReseau({ page: '2', ordre: 'desc' })),
    ).toBe(false)
  })

  it('est filtré par un rôle', () => {
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
