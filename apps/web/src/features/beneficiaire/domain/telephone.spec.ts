import { Telephone, telephoneDisplayString } from './telephone'

describe('Telephone', () => {
  it.each([
    ['0102030405', '+33102030405'],
    ['01 02 03 04 05', '+33102030405'],
    ['01.02.03.04.05', '+33102030405'],
    ['01-02-03-04-05', '+33102030405'],
    ['+33102030405', '+33102030405'],
    ['+33 1 02 03 04 05', '+33102030405'],
    ['0033102030405', '+33102030405'],
    ['(+33)102030405', '+33102030405'],
    ['0262202020', '+262262202020'], // La Réunion (national → +262)
    ['0269600102', '+262269600102'], // Mayotte (national → +262)
    ['+590690000001', '+590690000001'],
    ['+262262202020', '+262262202020'],
    ['00352621365161', '+352621365161'], // Luxembourg
    ['+352621365161', '+352621365161'], // Luxembourg
  ])('normalizes %s to %s', (input, expected) => {
    expect(Telephone(input)).toBe(expected)
  })

  it.each([
    '',
    '123',
    '01020304',
    'abcdefghij',
    '+1234567890',
    '00112030405',
  ])('rejects the invalid number %s', (value) => {
    expect(() => Telephone(value)).toThrow()
  })
})

describe('telephoneDisplayString', () => {
  it.each([
    ['+33102030405', '01 02 03 04 05'],
    ['+33612345678', '06 12 34 56 78'],
    ['+262262202020', '02 62 20 20 20'], // La Réunion
    ['+262269600102', '02 69 60 01 02'], // Mayotte
    ['+590690000001', '06 90 00 00 01'], // Guadeloupe
    ['+352621365161', '+352 621365161'], // Luxembourg : indicatif détaché
  ])('formats the canonical %s as %s', (input, expected) => {
    expect(telephoneDisplayString(input)).toBe(expected)
  })

  it.each([
    ['0102030405', '01 02 03 04 05'],
    ['01.02.03.04.05', '01 02 03 04 05'],
    ['01 02 03 04 05', '01 02 03 04 05'],
  ])('formats the legacy national %s as %s', (input, expected) => {
    expect(telephoneDisplayString(input)).toBe(expected)
  })

  it('returns an unrecognized value unchanged', () => {
    expect(telephoneDisplayString('poste 1234')).toBe('poste 1234')
  })
})
