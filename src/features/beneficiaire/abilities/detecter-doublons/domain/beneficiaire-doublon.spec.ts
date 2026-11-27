import { describe, expect, it } from 'vitest'
import { IdentifiantDeDoublon } from './beneficiaire-doublon'

describe('identifiant d’un doublon', () => {
  it('refuse un identifiant vide', () => {
    expect(IdentifiantDeDoublon.safe('')).toBeNull()
  })
})
