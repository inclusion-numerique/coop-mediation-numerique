import { describe, expect, it } from 'vitest'
import { expirationDuJeton } from './expiration-du-jeton.transfer'

const jeton = (charge: string): string =>
  `entete.${Buffer.from(charge).toString('base64url')}.signature`

describe('expiration d’un jeton', () => {
  it('lit l’expiration de la charge utile', () => {
    expect(
      expirationDuJeton(jeton(JSON.stringify({ exp: 1_800_000_000 }))),
    ).toEqual(new Date('2027-01-15T08:00:00.000Z'))
  })

  it.each<{ cas: string; jeton: string }>([
    { cas: 'sans charge utile', jeton: 'entete' },
    {
      cas: 'dont la charge utile n’est pas du JSON',
      jeton: jeton('pas du json'),
    },
    { cas: 'sans expiration', jeton: jeton(JSON.stringify({})) },
    {
      cas: 'dont l’expiration n’est pas un nombre',
      jeton: jeton(JSON.stringify({ exp: 'demain' })),
    },
    { cas: 'dont la charge utile est nulle', jeton: jeton('null') },
  ])('ne lit aucune expiration d’un jeton $cas', ({ jeton }) => {
    expect(expirationDuJeton(jeton)).toBeNull()
  })
})
