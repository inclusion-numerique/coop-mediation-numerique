import { describe, expect, it } from 'vitest'
import { ActeurId, CoordinateurId } from '../../../../domain'
import { lecteurDeLaSession } from './lecteur.transfer'

const id = 'd1b2c3d4-0000-4000-8000-000000000001'
const coordinateurId = 'd1b2c3d4-0000-4000-8000-000000000002'

describe('lecteur de la session', () => {
  it('lit un médiateur dans un utilisateur sans coordination', () => {
    expect(lecteurDeLaSession({ id, coordinateur: null })).toEqual({
      _tag: 'Mediateur',
      acteurId: ActeurId(id),
    })
  })

  it('lit un coordinateur dans un utilisateur qui coordonne', () => {
    expect(
      lecteurDeLaSession({ id, coordinateur: { id: coordinateurId } }),
    ).toEqual({
      _tag: 'Coordinateur',
      acteurId: ActeurId(id),
      coordinateurId: CoordinateurId(coordinateurId),
    })
  })
})
