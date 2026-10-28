import {
  type Acteur,
  CoordinateurId,
  MediateurId,
  NomDuCoordinateur,
} from '../domain'
import { equipeAffichee } from './equipe-affichee.presenter'

const premiere = CoordinateurId('00000000-0000-4000-8000-000000000001')
const seconde = CoordinateurId('00000000-0000-4000-8000-000000000002')

const acteur = (equipes: readonly CoordinateurId[]): Acteur => ({
  mediateurId: MediateurId('00000000-0000-4000-8000-000000000003'),
  coordinateurId: null,
  equipes: equipes.map((coordinateurId, index) => ({
    coordinateurId,
    coordonneePar: NomDuCoordinateur(`Coordinateur ${index + 1}`),
  })),
  departement: null,
})

describe('equipeAffichee', () => {
  it('numérote l’équipe quand le médiateur en a plusieurs', () => {
    expect(
      equipeAffichee(acteur([premiere, seconde]))({
        _tag: 'Equipe',
        coordinateurId: seconde,
      }),
    ).toEqual({ numero: 2, coordonneePar: 'Coordinateur 2' })
  })

  it('ne numérote pas l’équipe quand le médiateur n’en a qu’une', () => {
    expect(
      equipeAffichee(acteur([premiere]))({
        _tag: 'Equipe',
        coordinateurId: premiere,
      }),
    ).toBeNull()
  })

  it('ne numérote pas un tag qui n’est pas d’équipe', () => {
    expect(
      equipeAffichee(acteur([premiere, seconde]))({ _tag: 'National' }),
    ).toBeNull()
  })
})
