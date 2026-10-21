import { Telephone } from './telephone'

describe('téléphone', () => {
  it.each([
    ['un numéro national', '01 02 03 04 05', '+33102030405'],
    ['un numéro d’outre-mer', '0692 12 34 56', '+262692123456'],
    ['un numéro international', '+32 470 44 25 43', '+32470442543'],
  ])('ramène %s au format E.164', (_, saisi, canonique) => {
    expect(Telephone(saisi)).toBe(canonique)
  })

  it('refuse un numéro qui n’en est pas un', () => {
    expect(Telephone.safe('pas un numéro')).toBeNull()
  })
})
