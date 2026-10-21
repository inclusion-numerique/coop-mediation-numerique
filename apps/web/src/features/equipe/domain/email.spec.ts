import { Email } from './email'

describe('email d’invitation', () => {
  it('se ramène à sa forme canonique', () => {
    expect(Email('  Jean.Dupont@Example.COM ')).toBe('jean.dupont@example.com')
  })

  it('rend égales deux saisies qui ne diffèrent que par la casse', () => {
    expect(Email('A@b.fr')).toBe(Email('a@B.FR'))
  })

  it('refuse ce qui n’est pas un email', () => {
    expect(Email.safe('pas un email')).toBeNull()
  })
})
