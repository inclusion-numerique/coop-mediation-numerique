import { describe, expect, it } from 'vitest'
import { effectiveTrancheAge, TrancheAge } from './tranche-age'

const maintenant = new Date('2026-06-15T12:00:00.000Z')

describe('TrancheAge', () => {
  it('accepts a provided tranche', () => {
    expect(TrancheAge('VingtCinqTrenteNeuf')).toBe('VingtCinqTrenteNeuf')
  })

  it.each<{ cas: string; valeur: null | undefined }>([
    { cas: 'null', valeur: null },
    { cas: 'undefined', valeur: undefined },
  ])('defaults to NonCommunique when $cas', ({ valeur }) => {
    expect(TrancheAge(valeur)).toBe('NonCommunique')
  })
})

describe('effectiveTrancheAge', () => {
  it.each<{ annee: number; tranche: TrancheAge }>([
    { annee: 2021, tranche: TrancheAge('MoinsDeDouze') },
    { annee: 2012, tranche: TrancheAge('DouzeDixHuit') },
    { annee: 2006, tranche: TrancheAge('DixHuitVingtQuatre') },
    { annee: 1996, tranche: TrancheAge('VingtCinqTrenteNeuf') },
    { annee: 1976, tranche: TrancheAge('QuaranteCinquanteNeuf') },
    { annee: 1961, tranche: TrancheAge('SoixanteSoixanteNeuf') },
    { annee: 1946, tranche: TrancheAge('SoixanteDixPlus') },
  ])('derives $tranche for a birth year $annee', ({ annee, tranche }) => {
    expect(effectiveTrancheAge(annee, null, maintenant)).toBe(tranche)
  })

  it('parses a string birth year', () => {
    expect(effectiveTrancheAge('1996', null, maintenant)).toBe(
      'VingtCinqTrenteNeuf',
    )
  })

  it.each<{ cas: string; annee: string | number | null }>([
    { cas: 'an absent year', annee: null },
    { cas: 'a zero year', annee: 0 },
    { cas: 'a year before 1900', annee: 1899 },
    { cas: 'a year after the current one', annee: 2027 },
  ])('returns null for $cas without stored value', ({ annee }) => {
    expect(effectiveTrancheAge(annee, null, maintenant)).toBeNull()
  })

  it('derives from a valid birth year, ignoring the stored value', () => {
    expect(
      effectiveTrancheAge(1961, TrancheAge('VingtCinqTrenteNeuf'), maintenant),
    ).toBe('SoixanteSoixanteNeuf')
  })

  it.each<{ cas: string; annee: number | null }>([
    { cas: 'there is no birth year', annee: null },
    { cas: 'the birth year is out of range', annee: 1899 },
  ])('falls back to the stored value when $cas', ({ annee }) => {
    expect(
      effectiveTrancheAge(
        annee,
        TrancheAge('QuaranteCinquanteNeuf'),
        maintenant,
      ),
    ).toBe('QuaranteCinquanteNeuf')
  })
})
