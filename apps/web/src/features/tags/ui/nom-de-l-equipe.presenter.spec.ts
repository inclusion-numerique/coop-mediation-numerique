import { type Acteur, CoordinateurId, NomDuCoordinateur, role } from '../domain'
import { nomDeLEquipe } from './nom-de-l-equipe.presenter'

const sienne = CoordinateurId('00000000-0000-4000-8000-000000000001')
const autre = CoordinateurId('00000000-0000-4000-8000-000000000002')

const coordinateur: Acteur = {
  ...role(null, sienne),
  equipes: [],
  departement: null,
}

describe('nomDeLEquipe', () => {
  it('nomme l’équipe d’après son coordinateur', () => {
    expect(
      nomDeLEquipe(coordinateur, {
        coordinateurId: autre,
        coordonneePar: NomDuCoordinateur('Ada'),
      }),
    ).toBe('Ada')
  })

  it('appelle « Mon équipe » sa propre équipe sans nom', () => {
    expect(
      nomDeLEquipe(coordinateur, {
        coordinateurId: sienne,
        coordonneePar: null,
      }),
    ).toBe('Mon équipe')
  })

  it('appelle « Équipe » l’équipe d’un autre sans nom', () => {
    expect(
      nomDeLEquipe(coordinateur, {
        coordinateurId: autre,
        coordonneePar: null,
      }),
    ).toBe('Équipe')
  })
})
