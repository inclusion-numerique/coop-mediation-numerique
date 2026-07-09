import { repairTelephone, telephonePlaceholder } from './repair-telephone'

describe('repairTelephone', () => {
  it.each([
    ['0601020304', '+33601020304'], // national → international
    ['+33601020304', '+33601020304'], // déjà canonique
    ['06 03 05 38 14 ', '+33603053814'], // espaces/séparateurs parasites
    ['745298688', '+33745298688'], // 0 de tête manquant (9 chiffres)
    ['0651764142 / 0782950623', '+33651764142'], // multi « / » → 1er
    ['02.41.32.50.21\r\n06.21.76.22.27', '+33241325021'], // multi retour ligne → 1er
    ['02 31 20 32 78 ou 06 62 62 39 90', '+33231203278'], // multi « ou » → 1er
    ['00604417500', '+33604417500'], // 00 parasite → national
    ['+2620692344650', '+262692344650'], // 0 redondant après +262
    ['00352621365161', '+352621365161'], // Luxembourg (via le VO)
    ['++352 621 797 965', '+352621797965'], // + dédoublé
    ['33769592540', '+33769592540'], // international sans son +
    ['352 621 315 354', '+352621315354'], // idem, Luxembourg
    ['+237690513393', '+237690513393'], // étranger déjà canonique (Cameroun)
    ['0041779494741', '+41779494741'], // étranger via 00 (Suisse)
  ])('repairs %s to %s', (raw, expected) => {
    expect(repairTelephone(raw)).toBe(expected)
  })

  it.each([
    '',
    'pas-un-numero',
    '664', // trop court
    'RelaisNumérique', // texte
    '065295998', // 9 chiffres commençant par 0 : chiffre manquant, pas le 0 de tête
    '068?652866', // chiffre illisible
    '0000000000', // placeholder (vidé via telephonePlaceholder, pas réparé)
  ])('returns null for the irrecoverable %s', (raw) => {
    expect(repairTelephone(raw)).toBeNull()
  })
})

describe('telephonePlaceholder', () => {
  it.each([
    '0000000000',
    '00 00 00 00 00',
    '0.0.0.0',
  ])('detects the placeholder %s', (raw) => {
    expect(telephonePlaceholder(raw)).toBe(true)
  })

  it.each([
    '0601020304',
    '-',
    '',
    'aucun',
    '00 00 00 00 01',
  ])('leaves %s alone', (raw) => {
    expect(telephonePlaceholder(raw)).toBe(false)
  })
})
