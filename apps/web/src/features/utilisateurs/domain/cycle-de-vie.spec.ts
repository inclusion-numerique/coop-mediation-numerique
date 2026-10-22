import { cycleDeVie, inscription } from './cycle-de-vie'

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

  it.each([
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
