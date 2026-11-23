import { describe, expect, it } from 'vitest'
import { jetonNonExpire } from './se-deconnecter'

const maintenant = 1_800_000_000

const jeton = (charge: string): string =>
  `entete.${Buffer.from(charge).toString('base64url')}.signature`

describe('jetonNonExpire', () => {
  it('accepte un jeton qui expire au-delà de la marge', () => {
    expect(
      jetonNonExpire(
        jeton(JSON.stringify({ exp: maintenant + 60 })),
        maintenant,
      ),
    ).toBe(true)
  })

  it('refuse un jeton qui expire dans la marge de décalage d’horloge', () => {
    expect(
      jetonNonExpire(
        jeton(JSON.stringify({ exp: maintenant + 3 })),
        maintenant,
      ),
    ).toBe(false)
  })

  it('refuse un jeton déjà expiré', () => {
    expect(
      jetonNonExpire(
        jeton(JSON.stringify({ exp: maintenant - 60 })),
        maintenant,
      ),
    ).toBe(false)
  })

  it('refuse un jeton sans charge utile', () => {
    expect(jetonNonExpire('entete', maintenant)).toBe(false)
  })

  it('refuse une charge utile qui n’est pas du JSON', () => {
    expect(jetonNonExpire(jeton('pas du json'), maintenant)).toBe(false)
  })

  it('refuse une charge utile sans expiration', () => {
    expect(jetonNonExpire(jeton(JSON.stringify({})), maintenant)).toBe(false)
  })

  it('refuse une expiration qui n’est pas un nombre', () => {
    expect(
      jetonNonExpire(jeton(JSON.stringify({ exp: 'demain' })), maintenant),
    ).toBe(false)
  })

  it('refuse une charge utile nulle', () => {
    expect(jetonNonExpire(jeton('null'), maintenant)).toBe(false)
  })
})
