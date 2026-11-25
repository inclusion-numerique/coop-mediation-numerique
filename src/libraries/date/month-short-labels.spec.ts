import { describe, expect, it } from 'vitest'
import { libelleCourtDuMois } from './month-short-labels'

describe('libellé court du mois', () => {
  it('nomme le mois à partir de son numéro', () => {
    expect(libelleCourtDuMois(2)).toBe('Fév.')
  })

  it('rend le numéro d’un mois qui n’existe pas', () => {
    expect(libelleCourtDuMois(13)).toBe('13')
  })
})
