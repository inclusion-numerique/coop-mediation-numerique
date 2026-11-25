import { describe, expect, it } from 'vitest'
import {
  criteresDesFiltresDeCoordination,
  filtresDesCoordinations,
} from './coordinations.filtre'

const TAG = '6f1c2a4e-8b3d-4c5e-9f7a-1b2c3d4e5f60'

const criteres = (parametres: Record<string, string>) =>
  criteresDesFiltresDeCoordination(filtresDesCoordinations.charger(parametres))

describe('filtres des coordinations', () => {
  it('ne filtrent rien sans paramètre', () => {
    expect(criteres({})).toEqual({ periode: null, types: [], tags: [] })
  })

  it('retiennent les types et les tags valides, écartent les autres', () => {
    expect(
      criteres({
        types: 'Animation,Inconnu,Partenariat',
        tags: `${TAG},pas-un-tag`,
      }),
    ).toEqual({
      periode: null,
      types: ['Animation', 'Partenariat'],
      tags: [TAG],
    })
  })

  it('retiennent une période complète et dans le bon ordre', () => {
    expect(criteres({ du: '2026-01-01', au: '2026-03-31' }).periode).toEqual({
      du: new Date('2026-01-01'),
      au: new Date('2026-03-31'),
    })
  })

  it('écartent une période incomplète', () => {
    expect(criteres({ du: '2026-01-01' }).periode).toBeNull()
  })

  it('écartent une période inversée', () => {
    expect(criteres({ du: '2026-03-31', au: '2026-01-01' }).periode).toBeNull()
  })

  it('écartent une date invalide', () => {
    expect(criteres({ du: 'hier', au: '2026-01-01' }).periode).toBeNull()
  })
})
