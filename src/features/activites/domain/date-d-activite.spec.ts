import { describe, expect, it } from 'vitest'
import { DateDActivite } from './date-d-activite'

describe('date d’activité', () => {
  it('refuse une date antérieure au 17 novembre 2020', () => {
    expect(DateDActivite.safe('2020-11-16')).toBeNull()
  })

  it('refuse une date mal formée', () => {
    expect(DateDActivite.safe('0006-03-12T00:00')).toBeNull()
  })
})
