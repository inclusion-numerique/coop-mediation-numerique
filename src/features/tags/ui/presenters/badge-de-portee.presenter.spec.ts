import { describe, expect, it } from 'vitest'
import { badgeDePortee } from './badge-de-portee.presenter'

describe('badge de portée d’un tag', () => {
  it('nomme la portée sans infobulle hors équipe', () => {
    expect(badgeDePortee('National', null)).toEqual({
      libelle: 'Tag national',
      classe: 'fr-badge--green-menthe',
      infobulle: null,
    })
  })

  it('numérote l’équipe et nomme sa coordination dans l’infobulle', () => {
    expect(
      badgeDePortee('Equipe', { numero: 2, coordonneePar: 'Ada Lovelace' }),
    ).toEqual({
      libelle: 'Tag d’équipe 2',
      classe: 'fr-badge--brown-caramel',
      infobulle: 'Équipe 2 - Coordonnée par Ada Lovelace',
    })
  })
})
