import { describe, expect, it } from 'vitest'
import { testSessionUser } from '../fixtures/testSessionUser'
import { profilDeLaSession } from './profil-de-la-session'
import type { SessionUser } from './utilisateur-de-la-session'

const coordination = (coordinateurId: string, nom: string | null) => ({
  coordinateur: {
    id: coordinateurId,
    user: { name: nom },
    mediateursCoordonnes: [],
  },
})

const mediateurCoordonne: SessionUser = {
  ...testSessionUser,
  mediateur: {
    id: 'mediateur-1',
    isVisible: true,
    coordinations: [coordination('coordinateur-2', 'Anne Dupont')],
    _count: { enActivite: 1 },
  },
}

describe('profil de la session', () => {
  it('ne porte aucun rôle pour un compte sans profil', () => {
    expect(profilDeLaSession(testSessionUser)).toEqual({
      mediateurId: null,
      coordinateurId: null,
      equipes: [],
      departement: null,
    })
  })

  it('porte le médiateur et les équipes qui le coordonnent', () => {
    expect(profilDeLaSession(mediateurCoordonne)).toEqual({
      mediateurId: 'mediateur-1',
      coordinateurId: null,
      equipes: [{ coordinateurId: 'coordinateur-2', nom: 'Anne Dupont' }],
      departement: null,
    })
  })

  it('compte l’équipe du coordinateur parmi ses équipes', () => {
    expect(
      profilDeLaSession({
        ...testSessionUser,
        name: 'Paul Martin',
        coordinateur: {
          id: 'coordinateur-3',
          mediateursCoordonnes: [],
          ancienMediateursCoordonnes: [],
        },
      }).equipes,
    ).toEqual([{ coordinateurId: 'coordinateur-3', nom: 'Paul Martin' }])
  })

  it('tire le département de la première employeuse', () => {
    expect(
      profilDeLaSession({
        ...testSessionUser,
        emplois: [
          { id: 'emploi-1', structure: { nom: 'Mairie', codeInsee: '69123' } },
        ],
      }).departement,
    ).toBe('69')
  })
})
