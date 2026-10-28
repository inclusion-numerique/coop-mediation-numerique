import { TypeDActiviteDeCoordination } from '../../../domain'
import { decompterParTrimestre } from './activites-de-coordination'

const activite = (
  type: 'Animation' | 'Evenement' | 'Partenariat',
  date: string,
) => ({
  type: TypeDActiviteDeCoordination(type),
  date: new Date(date),
})

describe('décompte des activités de coordination par trimestre', () => {
  it('compte chaque type, même absent, sans aucune activité', () => {
    expect(decompterParTrimestre([])).toEqual({
      cumul: [
        { type: 'Animation', nombre: 0 },
        { type: 'Evenement', nombre: 0 },
        { type: 'Partenariat', nombre: 0 },
      ],
      trimestres: [],
    })
  })

  it('range les activités par trimestre, le plus récent en premier', () => {
    const { cumul, trimestres } = decompterParTrimestre([
      activite('Animation', '2025-11-12'),
      activite('Animation', '2026-03-31'),
      activite('Partenariat', '2026-01-01'),
      activite('Evenement', '2026-04-01'),
    ])

    expect(cumul).toEqual([
      { type: 'Animation', nombre: 2 },
      { type: 'Evenement', nombre: 1 },
      { type: 'Partenariat', nombre: 1 },
    ])
    expect(trimestres).toEqual([
      {
        trimestre: { annee: 2026, rang: 2 },
        decompte: [
          { type: 'Animation', nombre: 0 },
          { type: 'Evenement', nombre: 1 },
          { type: 'Partenariat', nombre: 0 },
        ],
      },
      {
        trimestre: { annee: 2026, rang: 1 },
        decompte: [
          { type: 'Animation', nombre: 1 },
          { type: 'Evenement', nombre: 0 },
          { type: 'Partenariat', nombre: 1 },
        ],
      },
      {
        trimestre: { annee: 2025, rang: 4 },
        decompte: [
          { type: 'Animation', nombre: 1 },
          { type: 'Evenement', nombre: 0 },
          { type: 'Partenariat', nombre: 0 },
        ],
      },
    ])
  })
})
