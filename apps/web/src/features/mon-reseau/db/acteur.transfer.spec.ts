import { type LigneActeur, versActeur } from './acteur.transfer'

const coordinateurDeLActeur = {
  id: 'b1b2c3d4-0000-4000-8000-000000000002',
  firstName: null,
  lastName: null,
  name: null,
  email: 'alex.durand@example.org',
  personneMain: null,
}

const ligneMinimale: LigneActeur = {
  id: 'b1b2c3d4-0000-4000-8000-000000000001',
  firstName: null,
  lastName: 'Martin',
  name: null,
  email: 'Camille.Martin@example.org',
  personneMain: null,
  coordinateur: null,
  mediateur: {
    id: 'b1b2c3d4-0000-4000-8000-000000000003',
    coordinations: [],
    _count: { enActivite: 0 },
  },
}

const ligneMaximale: LigneActeur = {
  id: 'b1b2c3d4-0000-4000-8000-000000000004',
  firstName: 'Sacha',
  lastName: 'Bernard',
  name: 'S. Bernard',
  email: 'sacha.bernard@example.org',
  personneMain: {
    affectationsEmploi: [{ source: 'idposte', estActive: true }],
  },
  coordinateur: { id: 'b1b2c3d4-0000-4000-8000-000000000005' },
  mediateur: {
    id: 'b1b2c3d4-0000-4000-8000-000000000006',
    coordinations: [{ coordinateur: { user: coordinateurDeLActeur } }],
    _count: { enActivite: 3 },
  },
}

describe('traduction d’un acteur', () => {
  it('traduit un médiateur hors dispositif sans lieu ni coordinateur', () => {
    expect(versActeur(ligneMinimale)).toEqual({
      acteurId: 'b1b2c3d4-0000-4000-8000-000000000001',
      nomAffiche: 'Martin',
      courriel: 'camille.martin@example.org',
      profil: {
        _tag: 'Mediateur',
        dispositif: 'HorsDispositif',
        mediation: {
          mediateurId: 'b1b2c3d4-0000-4000-8000-000000000003',
          nombreDeLieux: 0,
          coordinateurs: [],
        },
      },
    })
  })

  it('traduit un coordinateur du dispositif qui fait aussi de la médiation', () => {
    expect(versActeur(ligneMaximale)).toEqual({
      acteurId: 'b1b2c3d4-0000-4000-8000-000000000004',
      nomAffiche: 'Sacha Bernard',
      courriel: 'sacha.bernard@example.org',
      profil: {
        _tag: 'Coordinateur',
        dispositif: 'ConseillerNumerique',
        coordinateurId: 'b1b2c3d4-0000-4000-8000-000000000005',
        mediation: {
          mediateurId: 'b1b2c3d4-0000-4000-8000-000000000006',
          nombreDeLieux: 3,
          coordinateurs: [
            {
              acteurId: 'b1b2c3d4-0000-4000-8000-000000000002',
              nomAffiche: 'alex.durand@example.org',
              departement: '75',
            },
          ],
        },
      },
    })
  })

  it('traduit un coordinateur sans médiation', () => {
    expect(versActeur({ ...ligneMaximale, mediateur: null })?.profil).toEqual({
      _tag: 'Coordinateur',
      dispositif: 'ConseillerNumerique',
      coordinateurId: 'b1b2c3d4-0000-4000-8000-000000000005',
      mediation: null,
    })
  })

  it('écarte un compte qui n’est ni médiateur ni coordinateur', () => {
    expect(versActeur({ ...ligneMinimale, mediateur: null })).toBeNull()
  })

  it('écarte un compte au courriel invalide sans lever d’erreur', () => {
    expect(
      versActeur({ ...ligneMinimale, email: 'pas-un-courriel' }),
    ).toBeNull()
  })
})
