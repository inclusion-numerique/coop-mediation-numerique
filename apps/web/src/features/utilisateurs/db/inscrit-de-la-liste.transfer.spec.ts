import { inscritDeLaListeToDomain } from './inscrit-de-la-liste.transfer'

const ligne = {
  id: '3c4d5e6f-7a8b-4c9d-8e0f-1a2b3c4d5e6f',
  email: 'jeanne@example.com',
  firstName: null,
  lastName: null,
  phone: null,
  mediateur: null,
  coordinateur: null,
  personneMain: null,
}

describe('inscrit de la liste lu en base', () => {
  it('écarte un courriel illisible', () => {
    expect(
      inscritDeLaListeToDomain({ ...ligne, email: 'pas un courriel' }),
    ).toBeNull()
  })

  it('lit une ligne minimale sans identité ni rattachement', () => {
    expect(inscritDeLaListeToDomain(ligne)).toEqual({
      id: ligne.id,
      courriel: 'jeanne@example.com',
      prenom: null,
      nom: null,
      telephone: null,
      rattachements: { _tag: 'aucun' },
      dispositif: 'HorsDispositif',
    })
  })

  it('lit une ligne complète de coordinateur du dispositif', () => {
    expect(
      inscritDeLaListeToDomain({
        ...ligne,
        firstName: 'Jeanne',
        lastName: 'Martin',
        phone: '06 12 34 56 78',
        mediateur: { id: '1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8' },
        coordinateur: { id: '0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f' },
        personneMain: {
          isCoordinateur: true,
          affectationsEmploi: [{ source: 'idposte', estActive: true }],
        },
      }),
    ).toEqual({
      id: ligne.id,
      courriel: 'jeanne@example.com',
      prenom: 'Jeanne',
      nom: 'Martin',
      telephone: '+33612345678',
      rattachements: {
        _tag: 'mediateurEtCoordinateur',
        mediateur: '1a2b3c4d-5e6f-4708-8192-a3b4c5d6e7f8',
        coordinateur: '0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f',
      },
      dispositif: 'CoordinateurDuDispositif',
    })
  })

  it('ignore une déclaration de coordinateur sans affectation idposte', () => {
    expect(
      inscritDeLaListeToDomain({
        ...ligne,
        personneMain: { isCoordinateur: true, affectationsEmploi: [] },
      })?.dispositif,
    ).toBe('HorsDispositif')
  })
})
