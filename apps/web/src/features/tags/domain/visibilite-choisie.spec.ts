import { CodeDepartement } from '@app/web/libraries/departement'
import type { Acteur } from './acteur'
import { CoordinateurId } from './coordinateur-id'
import { MediateurId } from './mediateur-id'
import { NomDuCoordinateur } from './nom-du-coordinateur'
import { porteeChoisie } from './visibilite-choisie'

const mediateurId = MediateurId('00000000-0000-4000-8000-000000000001')
const coordinateurId = CoordinateurId('00000000-0000-4000-8000-000000000002')
const autreCoordinateurId = CoordinateurId(
  '00000000-0000-4000-8000-000000000003',
)

const mediateurCoordonne: Acteur = {
  mediateurId,
  coordinateurId: null,
  equipes: [{ coordinateurId, coordonneePar: NomDuCoordinateur('Ada') }],
  departement: CodeDepartement('69'),
}

const coordinateur: Acteur = {
  mediateurId: null,
  coordinateurId,
  equipes: [{ coordinateurId, coordonneePar: NomDuCoordinateur('Ada') }],
  departement: CodeDepartement('69'),
}

describe('porteeChoisie', () => {
  it('rattache un tag personnel au médiateur', () => {
    expect(porteeChoisie(mediateurCoordonne, { _tag: 'Personnel' })).toEqual({
      _tag: 'Personnel',
      proprietaire: { _tag: 'Mediateur', mediateurId },
    })
  })

  it('rattache un tag personnel au coordinateur qui n’est pas médiateur', () => {
    expect(porteeChoisie(coordinateur, { _tag: 'Personnel' })).toEqual({
      _tag: 'Personnel',
      proprietaire: { _tag: 'Coordinateur', coordinateurId },
    })
  })

  it('rattache un tag d’équipe à une équipe du médiateur', () => {
    expect(
      porteeChoisie(mediateurCoordonne, { _tag: 'Equipe', coordinateurId }),
    ).toEqual({ _tag: 'Equipe', coordinateurId })
  })

  it('refuse un tag d’équipe pour une équipe dont il n’est pas membre', () => {
    expect(
      porteeChoisie(mediateurCoordonne, {
        _tag: 'Equipe',
        coordinateurId: autreCoordinateurId,
      }),
    ).toBeNull()
  })

  it('rattache un tag départemental au département du coordinateur', () => {
    expect(porteeChoisie(coordinateur, { _tag: 'Departemental' })).toEqual({
      _tag: 'Departemental',
      departement: CodeDepartement('69'),
    })
  })

  it('refuse un tag départemental à un médiateur', () => {
    expect(
      porteeChoisie(mediateurCoordonne, { _tag: 'Departemental' }),
    ).toBeNull()
  })
})
