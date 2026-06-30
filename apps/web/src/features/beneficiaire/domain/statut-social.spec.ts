import { StatutSocial } from './statut-social'

describe('StatutSocial', () => {
  it('accepts a provided statut', () => {
    expect(StatutSocial('EnEmploi')).toBe('EnEmploi')
  })

  it('defaults to NonCommunique when absent', () => {
    expect(StatutSocial(null)).toBe('NonCommunique')
    expect(StatutSocial(undefined)).toBe('NonCommunique')
  })
})
