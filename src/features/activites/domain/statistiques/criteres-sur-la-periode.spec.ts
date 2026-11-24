import { describe, expect, it } from 'vitest'
import { CRITERES_VIDES } from '../consultation/criteres-vides'
import { Jour } from '../jour'
import { criteresSurLaPeriode } from './criteres-sur-la-periode'

describe('critères sur une période', () => {
  it('ne retiennent que la période', () => {
    expect(
      criteresSurLaPeriode({ du: Jour('2026-01-01'), au: Jour('2026-01-31') }),
    ).toStrictEqual({
      ...CRITERES_VIDES,
      periode: { du: Jour('2026-01-01'), au: Jour('2026-01-31') },
    })
  })
})
