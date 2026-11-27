import { describe, expect, it } from 'vitest'
import { CodesPostaux } from './codes-postaux'

describe('codes postaux', () => {
  it.each<string>(['69002', '45100,45000', '06100, 06000, 06200'])(
    'accepte « %s »',
    (valeur) => {
      expect(CodesPostaux.safe(valeur)).toBe(valeur)
    },
  )

  it.each<string>(['', ' ', '6900', 'Lyon'])('refuse « %s »', (valeur) => {
    expect(CodesPostaux.safe(valeur)).toBeNull()
  })
})
