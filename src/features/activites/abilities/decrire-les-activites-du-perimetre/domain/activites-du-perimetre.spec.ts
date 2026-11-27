import { describe, expect, it } from 'vitest'
import { CoordinateurId, MediateurId } from '../../../domain'
import { perimetreDesActivitesDe } from './activites-du-perimetre'

const MEDIATEUR = MediateurId('0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e01')
const MEMBRE = MediateurId('5d7e8a90-1b2c-4d3e-8f4a-6b7c8d9e0f12')
const COORDINATEUR = CoordinateurId('9a8b7c6d-5e4f-4a3b-9c2d-1e0f9a8b7c6d')

describe('périmètre des activités décrites', () => {
  it('ne restreint pas les activités au niveau national', () => {
    expect(perimetreDesActivitesDe({ type: 'National' })).toBeNull()
  })

  it('restreint aux activités du médiateur, sans coordinateur', () => {
    expect(
      perimetreDesActivitesDe({ type: 'Mediateur', mediateur: MEDIATEUR }),
    ).toEqual({ mediateurs: [MEDIATEUR], coordinateurId: null })
  })

  it('restreint aux activités des membres de l’équipe et de son coordinateur', () => {
    expect(
      perimetreDesActivitesDe({
        type: 'Equipe',
        coordinateur: COORDINATEUR,
        membres: [MEDIATEUR, MEMBRE],
      }),
    ).toEqual({ mediateurs: [MEDIATEUR, MEMBRE], coordinateurId: COORDINATEUR })
  })
})
