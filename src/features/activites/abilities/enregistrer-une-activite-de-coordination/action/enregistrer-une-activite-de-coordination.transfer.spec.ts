import { describe, expect, it } from 'vitest'
import { ActiviteDeCoordinationId } from '../../../domain'
import { activiteEnregistree } from './enregistrer-une-activite-de-coordination.transfer'

describe('activité de coordination enregistrée rendue par l’action', () => {
  it('rend l’identifiant de l’activité écrite et son type', () => {
    const id = ActiviteDeCoordinationId('b0000000-0000-4000-8000-000000000001')
    expect(
      activiteEnregistree({ activite: { id, _tag: 'Animation' } }),
    ).toEqual({ id, type: 'Animation' })
  })
})
