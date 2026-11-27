import { describe, expect, it } from 'vitest'
import { JetonAcces, type JetonsOAuth, jetonsARenouveler } from './jetons-oauth'

const maintenant = new Date('2026-11-26T10:00:00.000Z')

const jetons = (expiration: Date | null): JetonsOAuth => ({
  acces: JetonAcces('jeton-acces'),
  rafraichissement: null,
  expiration,
  portee: null,
})

describe('jetonsARenouveler', () => {
  it.each<[string, Date | null, boolean]>([
    ['un jeton sans expiration connue, que l’API jugera', null, false],
    [
      'un jeton valide plus d’une minute encore',
      new Date('2026-11-26T10:01:00.000Z'),
      false,
    ],
    [
      'un jeton qui expire dans moins d’une minute',
      new Date('2026-11-26T10:00:59.999Z'),
      true,
    ],
    ['un jeton déjà expiré', new Date('2026-11-26T09:00:00.000Z'), true],
  ])('renouvelle %s : %s', (_, expiration, attendu) => {
    expect(jetonsARenouveler(jetons(expiration), maintenant)).toBe(attendu)
  })
})
