import { describe, expect, it } from 'vitest'
import {
  acteurDe,
  coordinateurDe,
  mediateurDe,
  type Role,
  role,
} from './acteur'
import { CoordinateurId } from './coordinateur-id'
import { MediateurId } from './mediateur-id'

const mediateurId = MediateurId('00000000-0000-4000-8000-000000000001')
const coordinateurId = CoordinateurId('00000000-0000-4000-8000-000000000002')

describe('role', () => {
  it.each<[string, MediateurId | null, CoordinateurId | null, Role['_tag']]>([
    [
      'médiateur et coordinateur',
      mediateurId,
      coordinateurId,
      'MediateurEtCoordinateur',
    ],
    ['médiateur seulement', mediateurId, null, 'Mediateur'],
    ['coordinateur seulement', null, coordinateurId, 'Coordinateur'],
    ['sans rôle', null, null, 'SansRole'],
  ])('reconnaît un compte %s', (_, mediateur, coordinateur, attendu) => {
    expect(role(mediateur, coordinateur)._tag).toBe(attendu)
  })

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

describe('acteur', () => {
  const profil = {
    mediateurId,
    coordinateurId: null,
    equipes: [],
    departement: null,
  }

  it('reprend le rôle du profil', () => {
    expect(acteurDe(profil)._tag).toBe('Mediateur')
  })

  it('ne garde qu’une fois une équipe présente deux fois', () => {
    expect(
      acteurDe({
        ...profil,
        equipes: [
          { coordinateurId, nom: 'Anne Dupont' },
          { coordinateurId, nom: 'Anne Dupont' },
        ],
      }).equipes,
    ).toEqual([{ coordinateurId, coordonneePar: 'Anne Dupont' }])
  })

  it('n’a pas de nom de coordinateur quand le profil n’en porte pas', () => {
    expect(
      acteurDe({ ...profil, equipes: [{ coordinateurId, nom: null }] }).equipes,
    ).toEqual([{ coordinateurId, coordonneePar: null }])
  })

  it('reprend le département du profil', () => {
    expect(acteurDe({ ...profil, departement: '2A' }).departement).toBe('2A')
  })

  it('n’a pas de département quand celui du profil est invalide', () => {
    expect(acteurDe({ ...profil, departement: 'ZZ' }).departement).toBeNull()
  })

  it('reprend le rôle de coordinateur d’un profil qui ne fait pas de médiation', () => {
    expect(
      acteurDe({ ...profil, mediateurId: null, coordinateurId }),
    ).toMatchObject({ _tag: 'Coordinateur', coordinateurId })
  })
})
