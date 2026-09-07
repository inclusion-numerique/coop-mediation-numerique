import { nomAffiche } from './nom-affiche'

describe('sous quel nom un lieu se montre', () => {
  it('porte son nom d’usage quand il en a un', () => {
    expect(
      nomAffiche(
        'France services de La Chapelle-Saint-Luc',
        'Médiathèque du Parcours',
      ),
    ).toBe('Médiathèque du Parcours')
  })

  it('retombe sur la raison sociale sans nom d’usage', () => {
    expect(nomAffiche('France services de La Chapelle-Saint-Luc', null)).toBe(
      'France services de La Chapelle-Saint-Luc',
    )
  })

  // Un nom d'usage réduit à des espaces laisserait un titre vide.
  it('ignore un nom d’usage vide ou blanc', () => {
    expect(nomAffiche('Tiers-lieu du Port', '   ')).toBe('Tiers-lieu du Port')
    expect(nomAffiche('Tiers-lieu du Port', '')).toBe('Tiers-lieu du Port')
  })
})
