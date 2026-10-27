import { ZodError } from 'zod'
import { curseurDeCraV1 } from './curseur-de-cra-v1'

describe('curseurDeCraV1', () => {
  it('lit la date de création du dernier CRA lu', () => {
    expect(curseurDeCraV1('2026-10-01T10:00:00.000Z')).toEqual(
      new Date('2026-10-01T10:00:00.000Z'),
    )
  })

  it('refuse un curseur illisible', () => {
    expect(() => curseurDeCraV1('pas une date')).toThrow(ZodError)
  })
})
