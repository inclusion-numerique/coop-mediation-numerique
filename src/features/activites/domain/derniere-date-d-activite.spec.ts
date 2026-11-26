import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import { DateDActivite } from './date-d-activite'
import {
  dateDActiviteBornee,
  derniereDateDActivite,
} from './derniere-date-d-activite'
import { DateTropLointaine } from './errors'

describe('dernière date d’activité', () => {
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

  it('accepte la dernière date autorisée', () => {
    expect(
      dateDActiviteBornee(
        DateDActivite('2028-11-10'),
        DateDActivite('2026-11-10'),
      ),
    ).toEqual(success('2028-11-10'))
  })

  it('refuse une date au-delà de deux ans', () => {
    expect(
      dateDActiviteBornee(
        DateDActivite('2525-01-01'),
        DateDActivite('2026-11-10'),
      ),
    ).toEqual(failure(DateTropLointaine(DateDActivite('2028-11-10'))))
  })
})
