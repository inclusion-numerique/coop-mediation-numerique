import {
  criteresDesCoordinations,
  estFiltre,
} from './criteres-des-coordinations'

const TAG = '6f1c2a4e-8b3d-4c5e-9f7a-1b2c3d4e5f60'

describe('critères des activités de coordination', () => {
  it('ne filtre rien sans paramètre', () => {
    const criteres = criteresDesCoordinations({})

    expect(criteres).toEqual({ periode: null, types: [], tags: [] })
    expect(estFiltre(criteres)).toBe(false)
  })

  it('retient les types et les tags valides, écarte les autres', () => {
    expect(
      criteresDesCoordinations({
        types: 'Animation, Inconnu,Partenariat',
        tags: `${TAG},pas-un-tag`,
      }),
    ).toEqual({
      periode: null,
      types: ['Animation', 'Partenariat'],
      tags: [TAG],
    })
  })

  it('ne retient la période que complète et dans le bon ordre', () => {
    expect(
      criteresDesCoordinations({ du: '2026-01-01', au: '2026-03-31' }).periode,
    ).toEqual({ du: new Date('2026-01-01'), au: new Date('2026-03-31') })
    expect(criteresDesCoordinations({ du: '2026-01-01' }).periode).toBeNull()
    expect(
      criteresDesCoordinations({ du: '2026-03-31', au: '2026-01-01' }).periode,
    ).toBeNull()
    expect(
      criteresDesCoordinations({ du: 'hier', au: '2026-01-01' }).periode,
    ).toBeNull()
  })
})
