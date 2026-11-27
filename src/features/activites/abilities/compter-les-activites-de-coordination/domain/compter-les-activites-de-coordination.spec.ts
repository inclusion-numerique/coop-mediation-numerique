import { describe, expect, it } from 'vitest'
import { success } from '@/libraries/result'
import { CoordinateurId, TypeDActiviteDeCoordination } from '../../../domain'
import type { ActiviteADecompter } from './activites-de-coordination'
import { compterLesActivitesDeCoordination } from './compter-les-activites-de-coordination'

const coordinateurId = CoordinateurId('a05d8e7c-6dbf-4a99-9e4c-516f70819203')

const decompte = (activites: readonly ActiviteADecompter[]) =>
  compterLesActivitesDeCoordination({
    activitesDuCoordinateur: async () => activites,
  })({ coordinateurId })

const activite = (
  type: 'Animation' | 'Evenement' | 'Partenariat',
  date: string,
) => ({
  type: TypeDActiviteDeCoordination(type),
  date: new Date(date),
})

describe('décompte des activités de coordination par trimestre', () => {
  it('compte chaque type, même absent, sans aucune activité', async () => {
    expect(await decompte([])).toEqual(
      success({
        cumul: [
          { type: 'Animation', nombre: 0 },
          { type: 'Evenement', nombre: 0 },
          { type: 'Partenariat', nombre: 0 },
        ],
        trimestres: [],
      }),
    )
  })

  it('range les activités par trimestre, le plus récent en premier', async () => {
    expect(
      await decompte([
        activite('Animation', '2025-11-12'),
        activite('Animation', '2026-03-31'),
        activite('Partenariat', '2026-01-01'),
        activite('Evenement', '2026-04-01'),
      ]),
    ).toEqual(
      success({
        cumul: [
          { type: 'Animation', nombre: 2 },
          { type: 'Evenement', nombre: 1 },
          { type: 'Partenariat', nombre: 1 },
        ],
        trimestres: [
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
        ],
      }),
    )
  })
})
