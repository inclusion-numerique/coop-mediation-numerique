import { describe, expect, it } from 'vitest'
import { CoordinateurId } from './identifiants/coordinateur-id'
import { MediateurId } from './identifiants/mediateur-id'
import {
  coordinateurDe,
  identifiantsDe,
  mediateurDe,
  rattachements,
} from './rattachements'

const MEDIATEUR = MediateurId('1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8')
const COORDINATEUR = CoordinateurId('2b3c4d5e-6f70-4819-92a3-b4c5d6e7f809')

describe('rattachements d’un compte', () => {
  it.each<[string, MediateurId | null, CoordinateurId | null, string]>([
    ['aucun', null, null, 'aucun'],
    ['médiateur seul', MEDIATEUR, null, 'mediateur'],
    ['coordinateur seul', null, COORDINATEUR, 'coordinateur'],
    ['les deux', MEDIATEUR, COORDINATEUR, 'mediateurEtCoordinateur'],
  ])('%s', (_, mediateur, coordinateur, tag) => {
    expect(rattachements(mediateur, coordinateur)._tag).toBe(tag)
  })

  it.each<[string, MediateurId | null, CoordinateurId | null]>([
    ['aucun', null, null],
    ['médiateur seul', MEDIATEUR, null],
    ['coordinateur seul', null, COORDINATEUR],
    ['les deux', MEDIATEUR, COORDINATEUR],
  ])(
    'projette vers le couple d’identifiants : %s',
    (_, mediateurId, coordinateurId) => {
      expect(
        identifiantsDe(rattachements(mediateurId, coordinateurId)),
      ).toEqual({ mediateurId, coordinateurId })
    },
  )

  it('retrouve le médiateur rattaché', () => {
    expect(mediateurDe(rattachements(MEDIATEUR, COORDINATEUR))).toBe(MEDIATEUR)
  })

  it('retrouve le coordinateur rattaché', () => {
    expect(coordinateurDe(rattachements(MEDIATEUR, COORDINATEUR))).toBe(
      COORDINATEUR,
    )
  })
})
