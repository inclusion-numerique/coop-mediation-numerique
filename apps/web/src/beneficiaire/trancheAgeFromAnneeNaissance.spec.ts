import {
  effectiveTrancheAge,
  trancheAgeFromAnneeNaissance,
} from '@app/web/beneficiaire/trancheAgeFromAnneeNaissance'

const currentYear = new Date().getFullYear()

describe('trancheAgeFromAnneeNaissance', () => {
  test.each([
    { age: 5, expected: 'MoinsDeDouze' },
    { age: 14, expected: 'DouzeDixHuit' },
    { age: 20, expected: 'DixHuitVingtQuatre' },
    { age: 30, expected: 'VingtCinqTrenteNeuf' },
    { age: 50, expected: 'QuaranteCinquanteNeuf' },
    { age: 65, expected: 'SoixanteSoixanteNeuf' },
    { age: 80, expected: 'SoixanteDixPlus' },
  ])('returns $expected for someone aged $age', ({ age, expected }) => {
    expect(trancheAgeFromAnneeNaissance(currentYear - age)).toEqual(expected)
  })

  test('parses a string birth year', () => {
    expect(trancheAgeFromAnneeNaissance(`${currentYear - 30}`)).toEqual(
      'VingtCinqTrenteNeuf',
    )
  })

  test.each([
    null,
    undefined,
    0,
  ])('returns null for absent value %p', (value) => {
    expect(trancheAgeFromAnneeNaissance(value)).toBeNull()
  })

  test.each([
    1899,
    currentYear + 1,
  ])('returns null for out-of-range year %p', (year) => {
    expect(trancheAgeFromAnneeNaissance(year)).toBeNull()
  })
})

describe('effectiveTrancheAge', () => {
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
