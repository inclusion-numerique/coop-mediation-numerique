import { Siret, sirenDuSiret } from './siret'

describe('SIRET', () => {
  it('accepte 14 chiffres', () => {
    expect(Siret(' 13002526500013 ')).toBe('13002526500013')
  })

  it.each(['1300252650001', '130025265000134', '1300252650001A'])(
    'refuse %s',
    (siret) => {
      expect(Siret.safe(siret)).toBeNull()
    },
  )

  it('lit le SIREN du SIRET', () => {
    expect(sirenDuSiret(Siret('13002526500013'))).toBe('130025265')
  })
})
