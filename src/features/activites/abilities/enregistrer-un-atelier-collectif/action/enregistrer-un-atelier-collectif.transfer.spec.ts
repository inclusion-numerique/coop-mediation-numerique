import { describe, expect, it } from 'vitest'
import { ActiviteId } from '../../../domain'
import { atelierEnregistre } from './enregistrer-un-atelier-collectif.transfer'

describe('atelier enregistré rendu par l’action', () => {
  it('rend l’identifiant de l’atelier écrit et son type', () => {
    const id = ActiviteId('a0000000-0000-4000-8000-000000000001')
    expect(atelierEnregistre({ ecriture: { activite: { id } } })).toEqual({
      id,
      type: 'Collectif',
    })
  })
})
