import { describe, expect, it } from 'vitest'
import { Jour } from '../jour'
import { criteresDesStatistiques } from './criteres-des-statistiques'
import { criteresSurLaPeriode } from './criteres-sur-la-periode'

describe('critères sur une période', () => {
  it('ne retiennent que la période', () => {
    expect(
      criteresSurLaPeriode({ du: Jour('2026-01-01'), au: Jour('2026-01-31') }),
    ).toStrictEqual(
      criteresDesStatistiques({ du: '2026-01-01', au: '2026-01-31' }),
    )
  })

  it('acceptent une période sans borne', () => {
    expect(criteresSurLaPeriode({ du: null, au: null })).toStrictEqual(
      criteresDesStatistiques({}),
    )
  })
})
