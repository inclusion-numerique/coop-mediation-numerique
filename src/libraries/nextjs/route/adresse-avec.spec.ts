import { describe, expect, it } from 'vitest'
import { adresseAvec } from './adresse-avec'

describe('adresse avec des paramètres', () => {
  it('ajoute des paramètres à une adresse sans requête', () => {
    expect(
      adresseAvec('/coop/mes-activites/cra/collectif', {
        retour: '/coop/mes-activites?tags=a&du=2026-09-01',
      }),
    ).toBe(
      '/coop/mes-activites/cra/collectif?retour=%2Fcoop%2Fmes-activites%3Ftags%3Da%26du%3D2026-09-01',
    )
  })

  it('fusionne avec les paramètres déjà présents', () => {
    expect(adresseAvec('/saisie?retour=%2Fliste', { v: 'etat' })).toBe(
      '/saisie?retour=%2Fliste&v=etat',
    )
  })

  it('ignore les paramètres absents', () => {
    expect(adresseAvec('/saisie', { retour: undefined, v: null })).toBe(
      '/saisie',
    )
  })
})
