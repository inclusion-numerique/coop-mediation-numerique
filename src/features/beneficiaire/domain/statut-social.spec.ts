import { describe, expect, it } from 'vitest'
import { StatutSocial } from './statut-social'

describe('StatutSocial', () => {
  it('accepts a provided statut', () => {
    expect(StatutSocial('EnEmploi')).toBe('EnEmploi')
  })

  it.each<{ cas: string; valeur: null | undefined }>([
    { cas: 'null', valeur: null },
    { cas: 'undefined', valeur: undefined },
  ])('defaults to NonCommunique when $cas', ({ valeur }) => {
    expect(StatutSocial(valeur)).toBe('NonCommunique')
  })
})
