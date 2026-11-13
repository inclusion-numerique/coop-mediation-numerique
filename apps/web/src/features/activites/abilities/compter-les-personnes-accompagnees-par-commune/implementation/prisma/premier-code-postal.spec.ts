import { premierCodePostal } from './premier-code-postal'

describe('premier code postal', () => {
  it('ne garde que le premier code postal d’une commune qui en a plusieurs', () => {
    expect(premierCodePostal('06000, 06100')).toBe('06000')
  })

  it('n’invente pas de code postal', () => {
    expect(premierCodePostal(null)).toBeNull()
  })
})
