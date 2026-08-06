import { Telephone } from './telephone'

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
    ['0692000001', '+262692000001'], // La Réunion mobile (national → +262)
    ['+590690000001', '+590690000001'],
    ['+262262202020', '+262262202020'],
    ['00352621365161', '+352621365161'], // Luxembourg
    ['+352621365161', '+352621365161'], // Luxembourg
    ['0032470442543', '+32470442543'], // Belgique (00 → +32)
    ['0034631672091', '+34631672091'], // Espagne
    ['00393474946471', '+393474946471'], // Italie (10 chiffres nationaux)
    ['0041779494741', '+41779494741'], // Suisse
    ['0041 78 879 50 15', '+41788795015'], // Suisse, avec séparateurs
    ['00447799626909', '+447799626909'], // Royaume-Uni (10 chiffres nationaux)
    ['+237 6 90 51 33 93', '+237690513393'], // Cameroun
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
    '0001156452', // préfixe 000 : pas un numéro
    '10 50 97 96 91', // 10 chiffres commençant par 1, ni + ni 00
    '+1 899 343 9308', // indicatif de zone nord-américain 899 inexistant
  ])('rejects the invalid number %s', (value) => {
    expect(() => Telephone(value)).toThrow()
  })
})
