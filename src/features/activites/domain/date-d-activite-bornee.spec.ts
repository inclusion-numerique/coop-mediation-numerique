import { describe, expect, it } from 'vitest'
import { failure, success } from '@/libraries/result'
import { DateDActivite } from './date-d-activite'
import { dateDActiviteBornee } from './date-d-activite-bornee'
import { DateTropLointaine } from './errors'

describe('date d’activité bornée', () => {
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
