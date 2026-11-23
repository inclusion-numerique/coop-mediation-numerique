import { describe, expect, it } from 'vitest'
import { parametresDeLaPage } from './activites.response'

describe('paramètres de la page des activités', () => {
  it('omet la taille de page par défaut', () => {
    expect(
      parametresDeLaPage({
        take: 500,
        creationDepuis: undefined,
        modificationDepuis: undefined,
      }),
    ).toEqual([])
  })

  it('garde la taille de page en valeur absolue', () => {
    expect(
      parametresDeLaPage({
        take: -20,
        creationDepuis: undefined,
        modificationDepuis: undefined,
      }),
    ).toEqual([['page[size]', '20']])
  })

  it('reporte les filtres de date', () => {
    expect(
      parametresDeLaPage({
        take: 500,
        creationDepuis: '2025-09-01T00:00:00Z',
        modificationDepuis: '2025-10-01T00:00:00Z',
      }),
    ).toEqual([
      ['filter[creation][depuis]', '2025-09-01T00:00:00Z'],
      ['filter[modification][depuis]', '2025-10-01T00:00:00Z'],
    ])
  })
})
