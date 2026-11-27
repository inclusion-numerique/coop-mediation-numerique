import jwt from 'jsonwebtoken'
import { describe, expect, it } from 'vitest'
import { profilProConnectDuJeton } from './profil-proconnect.transfer'

const jetonDe = (charge: object): string => jwt.sign(charge, 'secret')

describe('profil ProConnect lu dans le jeton de userinfo', () => {
  it('lit le profil porté par le jeton', () => {
    expect(
      profilProConnectDuJeton(
        jetonDe({
          sub: 'agent-1',
          email: 'lea.martin@example.com',
          given_name: 'Léa',
          usual_name: 'Martin',
          phone_number: '0601020304',
          siret: '13002603200016',
        }),
      ),
    ).toMatchObject({
      sub: 'agent-1',
      email: 'lea.martin@example.com',
      given_name: 'Léa',
      usual_name: 'Martin',
      phone_number: '0601020304',
      siret: '13002603200016',
    })
  })

  it('rend absents le téléphone et le SIRET que le jeton ne porte pas', () => {
    expect(
      profilProConnectDuJeton(
        jetonDe({
          sub: 'agent-1',
          email: 'lea.martin@example.com',
          given_name: 'Léa',
          usual_name: 'Martin',
        }),
      ),
    ).toMatchObject({ phone_number: null, siret: null })
  })

  it('refuse un jeton qui ne porte pas de profil', () => {
    expect(() => profilProConnectDuJeton('pas-un-jeton')).toThrow()
  })
})
