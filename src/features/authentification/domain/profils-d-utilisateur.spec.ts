import { describe, expect, it } from 'vitest'
import {
  estConseillerNumerique,
  estCoordinateur,
  estMediateur,
} from './profils-d-utilisateur'

const sansRole = {
  mediateur: null,
  coordinateur: null,
  emplois: [],
  isConseillerNumerique: false,
}

const mediation = {
  id: 'mediateur-1',
  isVisible: true,
  coordinations: [],
  _count: { enActivite: 0 },
}

const coordination = {
  id: 'coordinateur-1',
  mediateursCoordonnes: [],
  ancienMediateursCoordonnes: [],
}

describe('profils d’utilisateur', () => {
  it('reconnaît un médiateur à son profil de médiation', () => {
    expect(estMediateur({ ...sansRole, mediateur: mediation })).toBe(true)
  })

  it('ne reconnaît pas de médiateur sans profil de médiation', () => {
    expect(estMediateur(sansRole)).toBe(false)
  })

  it('reconnaît un coordinateur à son profil de coordination', () => {
    expect(estCoordinateur({ ...sansRole, coordinateur: coordination })).toBe(
      true,
    )
  })

  it('ne reconnaît pas de coordinateur sans profil de coordination', () => {
    expect(estCoordinateur(sansRole)).toBe(false)
  })

  it('reconnaît un conseiller numérique à son dispositif', () => {
    expect(
      estConseillerNumerique({ ...sansRole, isConseillerNumerique: true }),
    ).toBe(true)
  })

  it('ne reconnaît pas de conseiller numérique hors du dispositif', () => {
    expect(estConseillerNumerique(sansRole)).toBe(false)
  })

  it('ne reconnaît pas de conseiller numérique en l’absence d’utilisateur', () => {
    expect(estConseillerNumerique(null)).toBe(false)
  })
})
