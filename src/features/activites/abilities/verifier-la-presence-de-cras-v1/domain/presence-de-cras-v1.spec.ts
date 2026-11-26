import { describe, expect, it } from 'vitest'
import { PresenceDeCrasV1 } from './presence-de-cras-v1'

describe('présence de CRA v1', () => {
  it.each<{ readonly presence: 'Presents' | 'Absents' }>([
    { presence: 'Presents' },
    { presence: 'Absents' },
  ])('accepte « $presence »', ({ presence }) => {
    expect(PresenceDeCrasV1(presence)).toBe(presence)
  })
})
