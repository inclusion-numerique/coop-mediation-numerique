import { describe, expect, it } from 'vitest'
import {
  ConseillerNumeriqueV1Id,
  CraV1Id,
  StructureV1Id,
} from './identifiants-v1'

describe('identifiants de la v1', () => {
  it.each<{ cas: string; decoder: (valeur: string) => string | null }>([
    { cas: 'CRA', decoder: CraV1Id.safe },
    { cas: 'conseiller numérique', decoder: ConseillerNumeriqueV1Id.safe },
    { cas: 'structure', decoder: StructureV1Id.safe },
  ])('refuse un identifiant de $cas vide', ({ decoder }) => {
    expect(decoder('')).toBeNull()
  })
})
