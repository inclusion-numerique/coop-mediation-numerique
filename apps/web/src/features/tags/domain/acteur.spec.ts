import { coordinateurDe, mediateurDe, role } from './acteur'
import { CoordinateurId } from './coordinateur-id'
import { MediateurId } from './mediateur-id'

const mediateurId = MediateurId('00000000-0000-4000-8000-000000000001')
const coordinateurId = CoordinateurId('00000000-0000-4000-8000-000000000002')

describe('role', () => {
  it.each([
    [
      'médiateur et coordinateur',
      mediateurId,
      coordinateurId,
      'MediateurEtCoordinateur',
    ],
    ['médiateur seulement', mediateurId, null, 'Mediateur'],
    ['coordinateur seulement', null, coordinateurId, 'Coordinateur'],
    ['sans rôle', null, null, 'SansRole'],
  ] as const)(
    'reconnaît un compte %s',
    (_, mediateur, coordinateur, attendu) => {
      expect(role(mediateur, coordinateur)._tag).toBe(attendu)
    },
  )

  it('retrouve les identifiants de chaque rôle', () => {
    const lesDeux = role(mediateurId, coordinateurId)
    expect([mediateurDe(lesDeux), coordinateurDe(lesDeux)]).toEqual([
      mediateurId,
      coordinateurId,
    ])
  })

  it('n’a aucun identifiant sans rôle', () => {
    const sansRole = role(null, null)
    expect([mediateurDe(sansRole), coordinateurDe(sansRole)]).toEqual([
      null,
      null,
    ])
  })
})
