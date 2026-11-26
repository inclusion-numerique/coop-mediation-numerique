import { describe, expect, it } from 'vitest'
import { enEchecTechnique, messageDe } from './echec-technique'

describe('échec technique', () => {
  it('garde le message d’une erreur levée', () => {
    expect(enEchecTechnique(new Error('base indisponible'))).toEqual({
      _tag: 'EchecTechnique',
      cause: 'base indisponible',
    })
  })

  it('écrit en texte une exception qui n’est pas une erreur', () => {
    expect(enEchecTechnique(503)).toEqual({
      _tag: 'EchecTechnique',
      cause: '503',
    })
  })

  it('donne le message d’une erreur levée', () => {
    expect(messageDe(new Error('délai dépassé'))).toBe('délai dépassé')
  })

  it('donne en texte une exception qui n’est pas une erreur', () => {
    expect(messageDe('délai dépassé')).toBe('délai dépassé')
  })
})
