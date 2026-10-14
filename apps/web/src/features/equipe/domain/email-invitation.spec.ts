import { EmailInvitation } from './email-invitation'

describe('email d’invitation', () => {
  it('se ramène à sa forme canonique', () => {
    expect(EmailInvitation('  Jean.Dupont@Example.COM ')).toBe(
      'jean.dupont@example.com',
    )
  })

  it('rend égales deux saisies qui ne diffèrent que par la casse', () => {
    expect(EmailInvitation('A@b.fr')).toBe(EmailInvitation('a@B.FR'))
  })

  it('refuse ce qui n’est pas un email', () => {
    expect(EmailInvitation.safe('pas un email')).toBeNull()
  })
})
