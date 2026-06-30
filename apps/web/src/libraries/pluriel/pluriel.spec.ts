import { pluriel } from './pluriel'

describe('pluriel', () => {
  it.each([
    [0, 'bénéficiaire'], // 0 est au singulier en français
    [1, 'bénéficiaire'],
    [2, 'bénéficiaires'],
    [10, 'bénéficiaires'],
  ])('accorde %i en « %s »', (nombre, attendu) => {
    expect(pluriel(nombre, 'bénéficiaire', 'bénéficiaires')).toBe(attendu)
  })

  it('gère les formes irrégulières', () => {
    expect(pluriel(1, 'cheval', 'chevaux')).toBe('cheval')
    expect(pluriel(3, 'cheval', 'chevaux')).toBe('chevaux')
  })

  it('gère les invariables', () => {
    expect(pluriel(2, 'prix', 'prix')).toBe('prix')
  })
})
