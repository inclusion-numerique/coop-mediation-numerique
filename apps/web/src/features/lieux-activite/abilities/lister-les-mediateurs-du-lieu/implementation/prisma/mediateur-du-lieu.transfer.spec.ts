import {
  type LigneMediateurDuLieu,
  versMediateurDuLieu,
} from './mediateur-du-lieu.transfer'

const ligne: LigneMediateurDuLieu = {
  id: 'c1b2c3d4-0000-4000-8000-000000000001',
  mediateur: {
    id: 'c1b2c3d4-0000-4000-8000-000000000002',
    user: {
      id: 'c1b2c3d4-0000-4000-8000-000000000003',
      firstName: 'Camille',
      lastName: null,
      name: null,
      email: 'Camille@example.org',
      personneMain: null,
      coordinateur: null,
    },
    coordinations: [],
    _count: { enActivite: 1 },
    activites: [],
  },
}

describe('traduction d’un médiateur du lieu', () => {
  it('traduit un médiateur hors dispositif qui n’a jamais exercé ici', () => {
    expect(versMediateurDuLieu(ligne)).toEqual({
      rattachementId: 'c1b2c3d4-0000-4000-8000-000000000001',
      mediateurId: 'c1b2c3d4-0000-4000-8000-000000000002',
      acteurId: 'c1b2c3d4-0000-4000-8000-000000000003',
      nomAffiche: 'Camille',
      courriel: 'camille@example.org',
      profil: 'Mediateur',
      nombreDeLieux: 1,
      coordinateurs: [],
      derniereActiviteIci: { _tag: 'Jamais' },
    })
  })

  it('traduit un coordinateur du dispositif, sa dernière activité ici et ses coordinateurs', () => {
    expect(
      versMediateurDuLieu({
        ...ligne,
        mediateur: {
          ...ligne.mediateur,
          user: {
            ...ligne.mediateur.user,
            personneMain: {
              affectationsEmploi: [{ source: 'idposte', estActive: true }],
            },
            coordinateur: { id: 'c1b2c3d4-0000-4000-8000-000000000004' },
          },
          coordinations: [
            {
              coordinateur: {
                user: {
                  id: 'c1b2c3d4-0000-4000-8000-000000000005',
                  firstName: null,
                  lastName: 'Durand',
                  name: null,
                  email: 'durand@example.org',
                  personneMain: null,
                },
              },
            },
          ],
          activites: [{ date: new Date('2026-05-04') }],
        },
      }),
    ).toMatchObject({
      profil: 'CoordinateurConseillerNumerique',
      coordinateurs: [
        {
          acteurId: 'c1b2c3d4-0000-4000-8000-000000000005',
          nomAffiche: 'Durand',
          departement: '75',
        },
      ],
      derniereActiviteIci: { _tag: 'Le', date: new Date('2026-05-04') },
    })
  })

  it('écarte un rattachement au courriel invalide', () => {
    expect(
      versMediateurDuLieu({
        ...ligne,
        mediateur: {
          ...ligne.mediateur,
          user: { ...ligne.mediateur.user, email: 'invalide' },
        },
      }),
    ).toBeNull()
  })
})
