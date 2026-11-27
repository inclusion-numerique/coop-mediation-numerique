import { describe, expect, it } from 'vitest'
import { ActiviteId } from '../../../domain'
import { accompagnementEnregistre } from './enregistrer-un-accompagnement-individuel.transfer'

describe('accompagnement enregistré rendu par l’action', () => {
  it('rend l’identifiant de l’accompagnement écrit et son type', () => {
    const id = ActiviteId('a0000000-0000-4000-8000-000000000001')
    expect(
      accompagnementEnregistre({ ecriture: { activite: { id } } }),
    ).toEqual({ id, type: 'Individuel' })
  })
})
