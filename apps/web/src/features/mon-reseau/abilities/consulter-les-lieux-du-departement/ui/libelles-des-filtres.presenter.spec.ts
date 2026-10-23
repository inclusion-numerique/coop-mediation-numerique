import { criteresDesLieux } from '../domain'
import {
  etiquettesDesCommunes,
  libelleDesResultats,
  parametresDeLURL,
} from './libelles-des-filtres.presenter'

describe('étiquettes des filtres de l’annuaire des lieux', () => {
  it('nomme chaque commune retenue', () => {
    expect(
      etiquettesDesCommunes(criteresDesLieux({ communes: '15014' }), [
        { value: '15014', label: 'Aurillac · 15000' },
        { value: '15187', label: 'Saint-Flour · 15100' },
      ]),
    ).toEqual([
      {
        parametre: 'communes',
        valeur: '15014',
        libelle: 'Commune : Aurillac · 15000',
      },
    ])
  })

  it.each([
    [0, false, 'Aucun lieu référencé'],
    [0, true, 'Aucun lieu ne correspond à votre recherche'],
    [1, false, '1 lieu'],
    [3, true, '3 lieux'],
  ])('annonce %i résultat(s), filtré : %s', (total, filtre, attendu) => {
    expect(libelleDesResultats(total, filtre)).toBe(attendu)
  })

  it('remet les critères lus dans l’URL', () => {
    expect(
      parametresDeLURL(criteresDesLieux({ communes: ['15014', '15187'] })),
    ).toEqual({
      recherche: undefined,
      communes: '15014,15187',
      tri: 'nomaz',
      page: '1',
      lignes: '20',
    })
  })
})
