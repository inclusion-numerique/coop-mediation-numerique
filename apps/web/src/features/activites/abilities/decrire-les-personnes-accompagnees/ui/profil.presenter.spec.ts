import {
  Effectif,
  genres,
  repartitionComplete,
  statutsSociaux,
  tranchesDAge,
} from '../../../domain'
import { profilPresente } from './profil.presenter'

const profil = profilPresente({
  total: Effectif(10),
  genres: repartitionComplete(genres, [2, 3, 5]),
  tranchesDAge: repartitionComplete(tranchesDAge, [1, 0, 0, 0, 0, 0, 9, 0]),
  statutsSociaux: repartitionComplete(statutsSociaux, [0, 0, 0, 10, 0]),
})

describe('profil présenté', () => {
  it('affiche les tranches d’âge des plus âgés aux plus jeunes', () => {
    expect(profil.trancheAges.map(({ value }) => value)).toEqual([
      'SoixanteDixPlus',
      'SoixanteSoixanteNeuf',
      'QuaranteCinquanteNeuf',
      'VingtCinqTrenteNeuf',
      'DixHuitVingtQuatre',
      'DouzeDixHuit',
      'MoinsDeDouze',
      'NonCommunique',
    ])
    expect(profil.trancheAges.at(0)).toMatchObject({
      label: '70 ans et plus',
      count: 9,
      proportion: 90,
    })
  })

  it('affiche les retraités en premier', () => {
    expect(profil.statutsSocial.at(0)).toEqual({
      value: 'Retraite',
      label: 'Retraité',
      count: 10,
      proportion: 100,
    })
  })

  it('libelle les genres', () => {
    expect(profil.genres.map(({ label }) => label)).toEqual([
      'Masculin',
      'Féminin',
      'Non communiqué',
    ])
  })
})
