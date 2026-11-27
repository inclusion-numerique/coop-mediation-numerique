import { describe, expect, it } from 'vitest'
import { AnneeNaissance } from './annee-naissance'
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
    expect(
      effectiveTrancheAge(AnneeNaissance(maintenant)(annee), null, maintenant),
    ).toBe(tranche)
  })

  it('returns null without birth year nor stored value', () => {
    expect(effectiveTrancheAge(null, null, maintenant)).toBeNull()
  })

  it('derives from the birth year, ignoring the stored value', () => {
    expect(
      effectiveTrancheAge(
        AnneeNaissance(maintenant)(1961),
        TrancheAge('VingtCinqTrenteNeuf'),
        maintenant,
      ),
    ).toBe('SoixanteSoixanteNeuf')
  })

  it('falls back to the stored value without birth year', () => {
    expect(
      effectiveTrancheAge(
        null,
        TrancheAge('QuaranteCinquanteNeuf'),
        maintenant,
      ),
    ).toBe('QuaranteCinquanteNeuf')
  })
})
