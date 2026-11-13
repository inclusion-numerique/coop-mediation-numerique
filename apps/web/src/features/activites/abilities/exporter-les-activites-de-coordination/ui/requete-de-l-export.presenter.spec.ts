import { requeteDeLExport } from './requete-de-l-export.presenter'

describe("requête de l'export des coordinations", () => {
  it('ne transmet que la période, les types et les tags', () => {
    expect(
      requeteDeLExport({
        page: '2',
        du: '2026-01-01',
        au: '2026-03-31',
        types: 'Animation',
      }),
    ).toBe('du=2026-01-01&au=2026-03-31&types=Animation')
  })

  it('est vide sans filtre', () => {
    expect(requeteDeLExport({ lignes: '20' })).toBe('')
  })
})
