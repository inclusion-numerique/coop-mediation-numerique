import { describe, expect, it } from 'vitest'
import { estActeurDeLaCoop } from './acteur-de-la-coop'

const compte: Parameters<typeof estActeurDeLaCoop>[0] = {
  role: 'User',
  inscriptionValidee: '2026-01-01T00:00:00.000Z',
  mediateur: { id: 'm1' },
  coordinateur: null,
}

describe('acteur de la coop', () => {
  it('un médiateur inscrit en est un', () => {
    expect(estActeurDeLaCoop(compte)).toBe(true)
  })

  it('un coordinateur inscrit en est un', () => {
    expect(
      estActeurDeLaCoop({
        ...compte,
        mediateur: null,
        coordinateur: { id: 'c1' },
      }),
    ).toBe(true)
  })

  it('un compte à l’inscription inachevée n’en est pas un', () => {
    expect(estActeurDeLaCoop({ ...compte, inscriptionValidee: null })).toBe(
      false,
    )
  })

  it('un compte sans rôle n’en est pas un', () => {
    expect(estActeurDeLaCoop({ ...compte, mediateur: null })).toBe(false)
  })

  it('un administrateur en est un', () => {
    expect(
      estActeurDeLaCoop({
        role: 'Admin',
        inscriptionValidee: null,
        mediateur: null,
        coordinateur: null,
      }),
    ).toBe(true)
  })
})
