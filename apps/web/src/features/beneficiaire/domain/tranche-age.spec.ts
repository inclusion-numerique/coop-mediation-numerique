import { effectiveTrancheAge, TrancheAge } from './tranche-age'

const currentYear = new Date().getFullYear()

describe('TrancheAge', () => {
  it('accepts a provided tranche', () => {
    expect(TrancheAge('VingtCinqTrenteNeuf')).toBe('VingtCinqTrenteNeuf')
  })

  it('defaults to NonCommunique when absent', () => {
    expect(TrancheAge(null)).toBe('NonCommunique')
    expect(TrancheAge(undefined)).toBe('NonCommunique')
  })
})

describe('effectiveTrancheAge', () => {
  test.each([
    { age: 5, expected: 'MoinsDeDouze' },
    { age: 14, expected: 'DouzeDixHuit' },
    { age: 20, expected: 'DixHuitVingtQuatre' },
    { age: 30, expected: 'VingtCinqTrenteNeuf' },
    { age: 50, expected: 'QuaranteCinquanteNeuf' },
    { age: 65, expected: 'SoixanteSoixanteNeuf' },
    { age: 80, expected: 'SoixanteDixPlus' },
  ])('derives $expected for someone aged $age', ({ age, expected }) => {
    expect(effectiveTrancheAge(currentYear - age)).toEqual(expected)
  })

  test('parses a string birth year', () => {
    expect(effectiveTrancheAge(`${currentYear - 30}`)).toEqual(
      'VingtCinqTrenteNeuf',
    )
  })

  test.each([
    null,
    undefined,
    0,
  ])('returns null for absent value %p', (value) => {
    expect(effectiveTrancheAge(value)).toBeNull()
  })

  test.each([
    1899,
    currentYear + 1,
  ])('returns null for out-of-range year %p', (year) => {
    expect(effectiveTrancheAge(year)).toBeNull()
  })

  test('derives from a valid birth year, ignoring the stored value', () => {
    expect(
      effectiveTrancheAge(currentYear - 65, 'VingtCinqTrenteNeuf'),
    ).toEqual('SoixanteSoixanteNeuf')
  })

  test('derives from the birth year when the stored value is null (the RDVSP bug)', () => {
    expect(effectiveTrancheAge(currentYear - 65, null)).toEqual(
      'SoixanteSoixanteNeuf',
    )
  })

  test('falls back to the stored value when there is no birth year', () => {
    expect(effectiveTrancheAge(null, 'QuaranteCinquanteNeuf')).toEqual(
      'QuaranteCinquanteNeuf',
    )
  })

  test('falls back to the stored value when the birth year is out of range', () => {
    expect(effectiveTrancheAge(1899, 'QuaranteCinquanteNeuf')).toEqual(
      'QuaranteCinquanteNeuf',
    )
  })

  test('returns null when neither birth year nor stored value is usable', () => {
    expect(effectiveTrancheAge(null, null)).toBeNull()
  })
})
