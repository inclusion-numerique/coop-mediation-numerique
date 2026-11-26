import { describe, expect, it } from 'vitest'
import { utilisateursActifsPresentes } from './utilisateurs-actifs.presenter'

const actifs = {
  total: 60,
  mediateurs: { value: 30, total: 50, percentage: 60 },
  conseillers: { value: 20, total: 40, percentage: 50 },
  coordinateurs: { value: 10, total: 20, percentage: 50 },
}

const parMois = [
  {
    mois: 'Nov.',
    mediateursActifs: 30,
    conseillersActifs: 20,
    coordinateursActifs: 10,
  },
]

describe('utilisateurs actifs présentés', () => {
  it('présente une série par catégorie, rapportée aux profils créés, et les actifs par mois', () => {
    expect(utilisateursActifsPresentes({ actifs, parMois })).toEqual({
      total: 60,
      series: [
        {
          label: 'Médiateurs numériques actifs',
          description: 'sur 50 profils de médiateurs numériques créés',
          key: 'mediateursActifs',
          value: 30,
          total: 50,
          percentage: 60,
        },
        {
          label: 'Conseillers numériques actifs',
          description: 'sur 40 profils de conseillers numériques créés',
          key: 'conseillersActifs',
          value: 20,
          total: 40,
          percentage: 50,
        },
        {
          label: 'Coordinateurs actifs',
          description: 'sur 20 profils de coordinateurs créés',
          key: 'coordinateursActifs',
          value: 10,
          total: 20,
          percentage: 50,
        },
      ],
      perMonth: parMois,
    })
  })
})
