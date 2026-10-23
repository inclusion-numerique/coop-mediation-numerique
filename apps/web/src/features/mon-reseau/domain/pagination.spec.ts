import { LignesParPage, NumeroDePage } from './pagination'

describe('pagination', () => {
  it.each([
    [undefined, 1],
    ['3', 3],
    ['0', 1],
    ['abc', 1],
  ])('lit la page %s comme %i', (valeur, attendu) => {
    expect(NumeroDePage(valeur)).toBe(attendu)
  })

  it.each([
    [undefined, 20],
    ['50', 50],
    ['100000', 20],
    ['-1', 20],
  ])('lit %s lignes comme %i', (valeur, attendu) => {
    expect(LignesParPage(valeur)).toBe(attendu)
  })
})
