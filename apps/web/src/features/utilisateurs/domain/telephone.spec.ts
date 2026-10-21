import { Telephone } from './telephone'

describe('téléphone d’un compte', () => {
  it.each([
    ['0612345678', '+33612345678'],
    ['06 12 34 56 78', '+33612345678'],
    ['+33612345678', '+33612345678'],
  ])('enregistre %s sous sa forme canonique %s', (saisi, canonique) => {
    expect(Telephone(saisi)).toBe(canonique)
  })

  it.each(['1234', 'pas un numéro', ''])('refuse %s', (saisi) => {
    expect(Telephone.safe(saisi)).toBeNull()
  })
})
