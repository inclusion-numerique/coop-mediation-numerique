import { describe, expect, it } from 'vitest'
import { stateConcordant } from './state-concordant.middleware'

describe('state du retour de ProConnect', () => {
  it('concorde quand il est celui du navigateur', () => {
    expect(stateConcordant({ recu: 'abc', attendu: 'abc' })).toBe(true)
  })

  it('ne concorde pas quand il diffère de celui du navigateur', () => {
    expect(stateConcordant({ recu: 'abc', attendu: 'xyz' })).toBe(false)
  })

  it('ne concorde pas quand le navigateur n’en a pas', () => {
    expect(stateConcordant({ recu: 'abc', attendu: undefined })).toBe(false)
  })

  it('ne concorde pas quand le retour n’en porte pas', () => {
    expect(stateConcordant({ recu: undefined, attendu: 'abc' })).toBe(false)
  })
})
