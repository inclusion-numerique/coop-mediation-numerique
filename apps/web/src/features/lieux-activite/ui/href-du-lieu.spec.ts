import { hrefDuLieu } from './href-du-lieu'

describe('lien vers la fiche d’un lieu', () => {
  it('mène sous le département du lieu', () => {
    expect(hrefDuLieu({ id: 'lieu-1', codeInsee: '97411' })).toBe(
      '/coop/mon-reseau/974/lieux/lieu-1',
    )
  })

  it('mène sous le département par défaut quand le lieu n’a pas de commune', () => {
    expect(hrefDuLieu({ id: 'lieu-1', codeInsee: null })).toBe(
      '/coop/mon-reseau/75/lieux/lieu-1',
    )
  })
})
