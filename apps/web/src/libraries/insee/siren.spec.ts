import { Siren } from './siren'

describe('SIREN', () => {
  it('accepte 9 chiffres', () => {
    expect(Siren(' 130025265 ')).toBe('130025265')
  })

  it.each(['13002526', '1300252650', '13002526A'])('refuse %s', (siren) => {
    expect(Siren.safe(siren)).toBeNull()
  })
})
