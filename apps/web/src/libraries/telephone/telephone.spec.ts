import { telephoneDisplayString } from './telephone'

describe('telephoneDisplayString', () => {
  it.each([
    ['+33102030405', '01 02 03 04 05'],
    ['+33612345678', '06 12 34 56 78'],
    ['+33468532187', '04 68 53 21 87'], // contact d'une employeuse (SA 5292)
    ['+262262202020', '02 62 20 20 20'], // La Réunion
    ['+262269600102', '02 69 60 01 02'], // Mayotte
    ['+590690000001', '06 90 00 00 01'], // Guadeloupe
    ['+352621365161', '+352 621 365 161'], // Luxembourg : format international
    ['+32470442543', '+32 470 44 25 43'], // Belgique : format international
    ['+237690513393', '+237 6 90 51 33 93'], // Cameroun : format international
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
