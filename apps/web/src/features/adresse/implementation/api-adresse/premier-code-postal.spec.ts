import { premierCodePostal } from './premier-code-postal'

describe('premier code postal', () => {
  it('garde le code d’une commune qui n’en a qu’un', () => {
    expect(premierCodePostal('69001')).toBe('69001')
  })

  it.each([
    ['01130, 01460', '01130'],
    ['04350,04510', '04350'],
    ['27420, 27630, 27510', '27420'],
  ])('garde le premier code de %s', (codes, attendu) => {
    expect(premierCodePostal(codes)).toBe(attendu)
  })
})
