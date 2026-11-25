import { describe, expect, it } from 'vitest'
import { periodeLaPlusLarge } from './options-de-la-barre.query'

const date = (jour: string) => new Date(jour)

describe('période la plus large', () => {
  it('couvre activités et rendez-vous sans modifier ses arguments', () => {
    const activites = { first: date('2026-02-01'), last: date('2026-03-01') }
    const rendezVous = { first: date('2026-01-15'), last: date('2026-02-15') }
    expect(periodeLaPlusLarge(activites, rendezVous)).toEqual({
      first: date('2026-01-15'),
      last: date('2026-03-01'),
    })
    expect(activites.first).toEqual(date('2026-02-01'))
  })

  it('garde la seule période connue', () => {
    expect(
      periodeLaPlusLarge(
        {},
        { first: date('2026-01-15'), last: date('2026-02-15') },
      ),
    ).toEqual({ first: date('2026-01-15'), last: date('2026-02-15') })
  })
})
