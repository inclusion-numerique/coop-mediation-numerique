import { describe, expect, it } from 'vitest'
import type { Production } from '../../domain'
import { type ProductionRow, productionToDomain } from './production.transfer'

const mediateurSans: NonNullable<ProductionRow['mediateur']> = {
  id: '1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8',
  _count: { activites: 0, beneficiaires: 0 },
}

const coordinateurSans: NonNullable<ProductionRow['coordinateur']> = {
  id: '0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f',
  _count: {
    mediateursCoordonnes: 0,
    ActiviteCoordination: 0,
    invitations: 0,
  },
}

describe('production d’un compte lue en base', () => {
  it.each<[string, ProductionRow, Production]>([
    [
      'un compte sans rattachement',
      { mediateur: null, coordinateur: null },
      { _tag: 'aucun' },
    ],
    [
      'un médiateur vierge',
      { mediateur: mediateurSans, coordinateur: null },
      {
        _tag: 'mediateur',
        mediateur: { activites: false, beneficiaires: false },
      },
    ],
    [
      'un médiateur qui a produit',
      {
        mediateur: {
          ...mediateurSans,
          _count: { activites: 12, beneficiaires: 3 },
        },
        coordinateur: null,
      },
      {
        _tag: 'mediateur',
        mediateur: { activites: true, beneficiaires: true },
      },
    ],
    [
      'un coordinateur vierge',
      { mediateur: null, coordinateur: coordinateurSans },
      {
        _tag: 'coordinateur',
        coordinateur: {
          equipe: false,
          activitesCoordination: false,
          invitationsEnAttente: false,
        },
      },
    ],
    [
      'un médiateur coordinateur qui a tout produit',
      {
        mediateur: {
          ...mediateurSans,
          _count: { activites: 1, beneficiaires: 0 },
        },
        coordinateur: {
          ...coordinateurSans,
          _count: {
            mediateursCoordonnes: 4,
            ActiviteCoordination: 2,
            invitations: 1,
          },
        },
      },
      {
        _tag: 'mediateurEtCoordinateur',
        mediateur: { activites: true, beneficiaires: false },
        coordinateur: {
          equipe: true,
          activitesCoordination: true,
          invitationsEnAttente: true,
        },
      },
    ],
  ])('lit %s', (_, ligne, production) => {
    expect(productionToDomain(ligne)).toEqual(production)
  })
})
