import { describe, expect, it } from 'vitest'
import { lireLaConnexionProConnect } from './connexion-proconnect.transfer'

const profile = {
  given_name: 'Léa',
  usual_name: 'Martin',
  phone_number: null,
  siret: '93429789600011',
}

describe('connexion par ProConnect', () => {
  it('lit l’utilisateur, le profil et le compte reçus de next-auth', () => {
    expect(
      lireLaConnexionProConnect({
        user: { id: 'u1', firstName: 'Léa', lastName: 'Martin' },
        profile,
        account: { provider: 'proconnect', access_token: 'jeton' },
      }).data,
    ).toEqual({
      user: {
        id: 'u1',
        firstName: 'Léa',
        lastName: 'Martin',
        phone: null,
        siret: null,
      },
      profile,
      account: {
        provider: 'proconnect',
        access_token: 'jeton',
        refresh_token: undefined,
        expires_at: undefined,
        id_token: undefined,
        scope: undefined,
      },
    })
  })

  it('lit une connexion sans compte', () => {
    expect(
      lireLaConnexionProConnect({ user: { id: 'u1' }, profile }).data?.account,
    ).toBeNull()
  })

  it('refuse un profil sans nom d’usage', () => {
    expect(
      lireLaConnexionProConnect({
        user: { id: 'u1' },
        profile: { given_name: 'Léa' },
      }).success,
    ).toBe(false)
  })
})
