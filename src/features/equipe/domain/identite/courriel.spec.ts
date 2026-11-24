import { describe, expect, it } from 'vitest'
import { Courriel } from './courriel'

describe('email d’invitation', () => {
  it('se ramène à sa forme canonique', () => {
    expect(Courriel('  Jean.Dupont@Example.COM ')).toBe(
      'jean.dupont@example.com',
    )
  })

  it('rend égales deux saisies qui ne diffèrent que par la casse', () => {
    expect(Courriel('A@b.fr')).toBe(Courriel('a@B.FR'))
  })

  it('refuse ce qui n’est pas un email', () => {
    expect(Courriel.safe('pas un email')).toBeNull()
  })
})
