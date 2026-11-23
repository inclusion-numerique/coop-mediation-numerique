import { describe, expect, it } from 'vitest'
import { peutGererLEquipe } from './gestionnaire'
import { CoordinateurId } from './identifiants/coordinateur-id'

const sonEquipe = CoordinateurId('550e8400-e29b-41d4-a716-446655440001')
const autreEquipe = CoordinateurId('550e8400-e29b-41d4-a716-446655440002')

describe('qui peut gérer une équipe', () => {
  it('son coordinateur', () => {
    expect(
      peutGererLEquipe({ type: 'Coordinateur', coordinateurId: sonEquipe })(
        sonEquipe,
      ),
    ).toBe(true)
  })

  it('un administrateur', () => {
    expect(peutGererLEquipe({ type: 'Administrateur' })(sonEquipe)).toBe(true)
  })

  it('mais pas le coordinateur d’une autre équipe', () => {
    expect(
      peutGererLEquipe({ type: 'Coordinateur', coordinateurId: autreEquipe })(
        sonEquipe,
      ),
    ).toBe(false)
  })

  it('ni quelqu’un d’autre', () => {
    expect(peutGererLEquipe({ type: 'Autre' })(sonEquipe)).toBe(false)
  })
})
