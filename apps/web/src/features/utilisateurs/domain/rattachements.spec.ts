import { CoordinateurId } from './coordinateur-id'
import { MediateurId } from './mediateur-id'
import {
  coordinateurDe,
  identifiantsDe,
  mediateurDe,
  rattachements,
} from './rattachements'

const MEDIATEUR = MediateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8')
const COORDINATEUR = CoordinateurId('2b3c4d5e-6f70-4819-92a3-b4c5d6e7f809')

describe('rattachements d’un compte', () => {
  it.each([
    ['aucun', null, null, 'aucun'],
    ['médiateur seul', MEDIATEUR, null, 'mediateur'],
    ['coordinateur seul', null, COORDINATEUR, 'coordinateur'],
    ['les deux', MEDIATEUR, COORDINATEUR, 'mediateurEtCoordinateur'],
  ] as const)('%s', (_, mediateur, coordinateur, tag) => {
    const rattache = rattachements(mediateur, coordinateur)

    expect(rattache._tag).toBe(tag)
    expect(mediateurDe(rattache)).toBe(mediateur)
    expect(coordinateurDe(rattache)).toBe(coordinateur)
  })

  it('projette l’union vers le couple que les features attendent', () => {
    expect(identifiantsDe(rattachements(MEDIATEUR, COORDINATEUR))).toEqual({
      mediateurId: MEDIATEUR,
      coordinateurId: COORDINATEUR,
    })
    expect(identifiantsDe({ _tag: 'aucun' })).toEqual({
      mediateurId: null,
      coordinateurId: null,
    })
  })
})
