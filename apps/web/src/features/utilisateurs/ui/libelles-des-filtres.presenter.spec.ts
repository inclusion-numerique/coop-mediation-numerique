import { filtresUtilisateurs } from '@app/web/features/utilisateurs/domain'
import { libellesDesFiltres } from './libelles-des-filtres.presenter'

const options = {
  employeuses: [{ value: '12', label: 'Mairie de Reims' }],
  lieux: [
    { value: '0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f', label: 'Médiathèque' },
  ],
  communes: [{ value: '51454', label: 'Reims' }],
  departements: [{ value: '51', label: '51 · Marne' }],
}

describe('libellés des filtres', () => {
  it('nomme chaque filtre actif', () => {
    expect(
      libellesDesFiltres(
        filtresUtilisateurs({
          roles: 'mediateur',
          conseiller_numerique: '0',
          statut: 'inactif30',
          employeuses: '12',
          lieux: '0d1a1e7e-1f2b-4c3d-8e4f-5a6b7c8d9e0f',
          communes: '51454',
          departements: '51',
        }),
        options,
      ).map(({ libelle }) => libelle),
    ).toEqual([
      'Médiateur',
      'Hors dispositif',
      'Inactif J+30',
      'Employeuse : Mairie de Reims',
      'Lieu d’activité : Médiathèque',
      'Commune : Reims',
      'Département : 51 · Marne',
    ])
  })

  it('ne nomme rien sans filtre', () => {
    expect(libellesDesFiltres(filtresUtilisateurs({}), options)).toEqual([])
  })
})
