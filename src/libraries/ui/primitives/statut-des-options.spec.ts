import { describe, expect, it } from 'vitest'
import { statutDesOptions } from './statut-des-options'

describe('statut des options', () => {
  it('n’annonce rien quand la liste est fermée', () => {
    expect(
      statutDesOptions({ ouverte: false, nombre: 3, messageSiVide: false }),
    ).toBe('')
  })

  it('annonce un seul résultat au singulier', () => {
    expect(
      statutDesOptions({ ouverte: true, nombre: 1, messageSiVide: false }),
    ).toBe('1 résultat')
  })

  it('annonce plusieurs résultats au pluriel', () => {
    expect(
      statutDesOptions({ ouverte: true, nombre: 12, messageSiVide: false }),
    ).toBe('12 résultats')
  })

  it('annonce l’absence de résultat', () => {
    expect(
      statutDesOptions({ ouverte: true, nombre: 0, messageSiVide: false }),
    ).toBe('Aucun résultat')
  })

  it('laisse la liste vide parler quand elle porte son propre message', () => {
    expect(
      statutDesOptions({ ouverte: true, nombre: 0, messageSiVide: true }),
    ).toBe('')
  })
})
