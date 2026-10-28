import { CodeDepartement } from '@app/web/libraries/departement'
import {
  type Acteur,
  CoordinateurId,
  MediateurId,
  NomDuCoordinateur,
} from '../../../domain'
import { visibilitesProposees } from './visibilites.presenter'

const premiere = CoordinateurId('00000000-0000-4000-8000-000000000001')
const seconde = CoordinateurId('00000000-0000-4000-8000-000000000002')

const acteur = (surcharge: Partial<Acteur>): Acteur => ({
  mediateurId: MediateurId('00000000-0000-4000-8000-000000000003'),
  coordinateurId: null,
  equipes: [],
  departement: CodeDepartement('69'),
  ...surcharge,
})

describe('visibilitesProposees', () => {
  it('propose seulement le tag personnel à un médiateur sans équipe', () => {
    expect(visibilitesProposees(acteur({}))).toEqual([{ _tag: 'Personnel' }])
  })

  it('numérote les équipes quand le médiateur en a plusieurs', () => {
    expect(
      visibilitesProposees(
        acteur({
          equipes: [
            {
              coordinateurId: premiere,
              coordonneePar: NomDuCoordinateur('Ada'),
            },
            {
              coordinateurId: seconde,
              coordonneePar: NomDuCoordinateur('Bob'),
            },
          ],
        }),
      ),
    ).toEqual([
      { _tag: 'Personnel' },
      {
        _tag: 'Equipe',
        coordinateurId: premiere,
        numero: 1,
        coordonneePar: 'Ada',
      },
      {
        _tag: 'Equipe',
        coordinateurId: seconde,
        numero: 2,
        coordonneePar: 'Bob',
      },
    ])
  })

  it('propose le tag départemental au coordinateur qui a un département', () => {
    expect(
      visibilitesProposees(
        acteur({
          mediateurId: null,
          coordinateurId: premiere,
          equipes: [
            {
              coordinateurId: premiere,
              coordonneePar: NomDuCoordinateur('Ada'),
            },
          ],
        }),
      ),
    ).toEqual([
      { _tag: 'Personnel' },
      {
        _tag: 'Equipe',
        coordinateurId: premiere,
        numero: null,
        coordonneePar: 'Ada',
      },
      { _tag: 'Departemental' },
    ])
  })
})
