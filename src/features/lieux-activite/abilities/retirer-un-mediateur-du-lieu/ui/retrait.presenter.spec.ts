import { describe, expect, it } from 'vitest'
import { dateDuDernierPassage } from './retrait.presenter'

describe('présentation du retrait d’un médiateur', () => {
  it('reprend la date de la dernière activité du médiateur sur le lieu', () => {
    expect(
      dateDuDernierPassage({ _tag: 'Le', date: new Date('2026-05-04') }),
    ).toEqual(new Date('2026-05-04'))
  })

  it('n’a pas de date quand le médiateur n’a jamais exercé sur le lieu', () => {
    expect(dateDuDernierPassage({ _tag: 'Jamais' })).toBeNull()
  })
})
