import { repairTelephone } from './repair-telephone'

describe('repairTelephone', () => {
  it.each([
    ['0601020304', '+33601020304'], // national → international
    ['+33601020304', '+33601020304'], // déjà canonique
    ['06 03 05 38 14 ', '+33603053814'], // espaces/séparateurs parasites
    ['745298688', '+33745298688'], // 0 de tête manquant (9 chiffres)
    ['0651764142 / 0782950623', '+33651764142'], // multi « / » → 1er
    ['02.41.32.50.21\r\n06.21.76.22.27', '+33241325021'], // multi retour ligne → 1er
    ['00604417500', '+33604417500'], // 00 parasite → national
    ['+2620692344650', '+262692344650'], // 0 redondant après +262
    ['00352621365161', '+352621365161'], // Luxembourg (via le VO)
  ])('repairs %s to %s', (raw, expected) => {
    expect(repairTelephone(raw)).toBe(expected)
  })

  it.each([
    '',
    'pas-un-numero',
    '+237690513393', // étranger
    '0041779494741', // étranger
    '664', // trop court
    'RelaisNumérique', // texte
  ])('returns null for the irrecoverable %s', (raw) => {
    expect(repairTelephone(raw)).toBeNull()
  })
})
