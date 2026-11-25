import { Page, PageSize, Search, Sort } from '@arckit/resultset'
import { describe, expect, it } from 'vitest'
import { estFiltre } from '../../domain'
import { criteresDesLieuxDuReseau } from './lieux-du-reseau.filtre'

describe('critères de l’annuaire des lieux', () => {
  it('garde la recherche, les communes valides, le tri et la page', () => {
    expect(
      criteresDesLieuxDuReseau({
        recherche: ' médiathèque ',
        communes: '15014,abc,2A004',
        tri: 'modification',
        ordre: 'desc',
        page: '2',
        lignes: '50',
      }),
    ).toEqual({
      recherche: Search('médiathèque'),
      communes: ['15014', '2A004'],
      tri: Sort('modification', 'desc'),
      page: Page(2),
      pageSize: PageSize(50),
    })
  })

  it('se replie sur la première page de 20 lieux sans critère', () => {
    expect(criteresDesLieuxDuReseau({})).toEqual({
      recherche: Search(''),
      communes: [],
      tri: Sort('nom', 'asc'),
      page: Page(1),
      pageSize: PageSize(20),
    })
  })

  it('n’est pas filtré par le tri ni la page', () => {
    expect(
      estFiltre(criteresDesLieuxDuReseau({ tri: 'modification', page: '3' })),
    ).toBe(false)
  })

  it('est filtré par des communes', () => {
    expect(estFiltre(criteresDesLieuxDuReseau({ communes: '15014' }))).toBe(
      true,
    )
  })

  it('ne lit que la première valeur d’un paramètre répété', () => {
    expect(
      criteresDesLieuxDuReseau({
        recherche: ['médiathèque', 'mairie'],
        tri: ['inconnu'],
      }),
    ).toMatchObject({ recherche: 'médiathèque', tri: Sort('nom', 'asc') })
  })
})
