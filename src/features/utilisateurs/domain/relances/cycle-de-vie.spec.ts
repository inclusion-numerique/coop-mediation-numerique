import { describe, expect, it } from 'vitest'
import { cycleDeVie, inscription } from './cycle-de-vie'
import type { Jalon } from './jalon'

const creeLe = new Date('2026-01-01')
const inscritLe = new Date('2026-01-02')
const supprimeLe = new Date('2026-03-01')

describe('cycle de vie d’un compte', () => {
  it('un compte supprimé garde son cycle d’avant la suppression', () => {
    expect(cycleDeVie({ creeLe, inscritLe, supprimeLe })).toEqual({
      _tag: 'Supprime',
      depuis: supprimeLe,
      avant: { _tag: 'Inscrit', inscritLe },
    })
  })

  it.each<[Parameters<typeof cycleDeVie>[0], Jalon]>([
    [{ creeLe, inscritLe: null, supprimeLe: null }, { _tag: 'Jamais' }],
    [
      { creeLe, inscritLe, supprimeLe: null },
      { _tag: 'Le', date: inscritLe },
    ],
    [
      { creeLe, inscritLe, supprimeLe },
      { _tag: 'Le', date: inscritLe },
    ],
    [{ creeLe, inscritLe: null, supprimeLe }, { _tag: 'Jamais' }],
  ])('%o est inscrit : %o', (dates, attendu) => {
    expect(inscription(cycleDeVie(dates))).toEqual(attendu)
  })
})
