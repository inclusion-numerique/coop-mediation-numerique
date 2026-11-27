import { describe, expect, it } from 'vitest'
import { DateDActivite, derniereDateDActivite } from './date-d-activite'

describe('date d’activité', () => {
  it('refuse une date antérieure au 17 novembre 2020', () => {
    expect(DateDActivite.safe('2020-11-16')).toBeNull()
  })

  it('refuse une date mal formée', () => {
    expect(DateDActivite.safe('0006-03-12T00:00')).toBeNull()
  })

  it('autorise une activité planifiée jusqu’à deux ans à l’avance', () => {
    expect(derniereDateDActivite(DateDActivite('2026-11-10'))).toBe(
      '2028-11-10',
    )
  })

  it('ramène un 29 février au 28 février deux ans plus tard, comme la base', () => {
    expect(derniereDateDActivite(DateDActivite('2028-02-29'))).toBe(
      '2030-02-28',
    )
  })
})
