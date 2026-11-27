import { describe, expect, it } from 'vitest'
import { CodeDepartement } from '@/libraries/insee'
import {
  type Acteur,
  CoordinateurId,
  MediateurId,
  NomDuCoordinateur,
  NomDuTag,
  type Portee,
  role,
  TagId,
  type VisibiliteChoisie,
} from '../../../domain'
import { creerUnTag } from './creer-un-tag'

const tagId = TagId('0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e01')
const mediateurId = MediateurId('00000000-0000-4000-8000-000000000001')
const coordinateurId = CoordinateurId('00000000-0000-4000-8000-000000000002')
const autreCoordinateurId = CoordinateurId(
  '00000000-0000-4000-8000-000000000003',
)

const mediateurCoordonne: Acteur = {
  ...role(mediateurId, null),
  equipes: [{ coordinateurId, coordonneePar: NomDuCoordinateur('Ada') }],
  departement: CodeDepartement('69'),
}

const coordinateur: Acteur = {
  ...role(null, coordinateurId),
  equipes: [],
  departement: CodeDepartement('69'),
}

const sansRole: Acteur = { ...role(null, null), equipes: [], departement: null }

const creer = (acteur: Acteur, visibilite: VisibiliteChoisie) =>
  creerUnTag({ enregistrer: async () => tagId })({
    acteur,
    nom: NomDuTag('Parentalité'),
    description: null,
    visibilite,
  })

describe('créer un tag', () => {
  it.each<{
    cas: string
    acteur: Acteur
    visibilite: VisibiliteChoisie
    portee: Portee
  }>([
    {
      cas: 'rattache un tag personnel au médiateur',
      acteur: mediateurCoordonne,
      visibilite: { _tag: 'Personnel' },
      portee: {
        _tag: 'Personnel',
        proprietaire: { _tag: 'Mediateur', mediateurId },
      },
    },
    {
      cas: 'rattache un tag personnel au coordinateur qui n’est pas médiateur',
      acteur: coordinateur,
      visibilite: { _tag: 'Personnel' },
      portee: {
        _tag: 'Personnel',
        proprietaire: { _tag: 'Coordinateur', coordinateurId },
      },
    },
    {
      cas: 'rattache un tag d’équipe à une équipe du médiateur',
      acteur: mediateurCoordonne,
      visibilite: { _tag: 'Equipe', coordinateurId },
      portee: { _tag: 'Equipe', coordinateurId },
    },
    {
      cas: 'rattache un tag d’équipe à l’équipe que le coordinateur dirige',
      acteur: coordinateur,
      visibilite: { _tag: 'Equipe', coordinateurId },
      portee: { _tag: 'Equipe', coordinateurId },
    },
    {
      cas: 'rattache un tag départemental au département du coordinateur',
      acteur: coordinateur,
      visibilite: { _tag: 'Departemental' },
      portee: { _tag: 'Departemental', departement: CodeDepartement('69') },
    },
  ])('$cas', async ({ acteur, visibilite, portee }) => {
    expect(await creer(acteur, visibilite)).toEqual({
      success: true,
      data: { id: tagId, nom: 'Parentalité', description: null, portee },
    })
  })

  it.each<{ cas: string; acteur: Acteur; visibilite: VisibiliteChoisie }>([
    {
      cas: 'refuse un tag d’équipe pour une équipe dont il n’est pas membre',
      acteur: mediateurCoordonne,
      visibilite: { _tag: 'Equipe', coordinateurId: autreCoordinateurId },
    },
    {
      cas: 'refuse un tag départemental à un médiateur',
      acteur: mediateurCoordonne,
      visibilite: { _tag: 'Departemental' },
    },
    {
      cas: 'refuse un tag départemental à un coordinateur sans département',
      acteur: { ...coordinateur, departement: null },
      visibilite: { _tag: 'Departemental' },
    },
    {
      cas: 'refuse un tag personnel à un compte sans rôle',
      acteur: sansRole,
      visibilite: { _tag: 'Personnel' },
    },
  ])('$cas', async ({ acteur, visibilite }) => {
    expect(await creer(acteur, visibilite)).toEqual({
      success: false,
      error: { _tag: 'VisibiliteNonAutorisee' },
    })
  })
})
