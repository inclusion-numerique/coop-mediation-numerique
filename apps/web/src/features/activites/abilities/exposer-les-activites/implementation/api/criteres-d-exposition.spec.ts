import { ZodError } from 'zod'
import { criteresDExposition, curseurDActivite } from './criteres-d-exposition'

describe('criteresDExposition', () => {
  it('ne restreint rien sans date', () => {
    expect(criteresDExposition({ creation: {}, modification: {} })).toEqual({
      creeesDepuis: null,
      modifieesDepuis: null,
    })
  })

  it('lit les dates de création et de modification', () => {
    expect(
      criteresDExposition({
        creation: { depuis: '2026-09-01T00:00:00Z' },
        modification: { depuis: '2026-10-01T00:00:00Z' },
      }),
    ).toEqual({
      creeesDepuis: new Date('2026-09-01T00:00:00Z'),
      modifieesDepuis: new Date('2026-10-01T00:00:00Z'),
    })
  })
})

describe('curseurDActivite', () => {
  it('lit la date de modification et l’identifiant du curseur', () => {
    expect(
      curseurDActivite([
        '2026-10-01T10:00:00.000Z',
        '00000000-0000-4000-8000-000000000001',
      ]),
    ).toEqual({
      modification: new Date('2026-10-01T10:00:00.000Z'),
      id: '00000000-0000-4000-8000-000000000001',
    })
  })

  it('refuse un curseur illisible', () => {
    expect(() => curseurDActivite(['pas une date', 'pas un id'])).toThrow(
      ZodError,
    )
  })
})
