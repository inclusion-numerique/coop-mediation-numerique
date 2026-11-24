import { describe, expect, it } from 'vitest'
import {
  communesEnParametres,
  roleEnParametres,
  sansLEtiquette,
} from './filtres-du-reseau.search-params'

describe('filtres du réseau en paramètres', () => {
  it('écrit les communes et revient à la première page', () => {
    expect(communesEnParametres(['15014', '15187'])).toStrictEqual({
      communes: '15014,15187',
      page: null,
    })
  })

  it('retire les communes', () => {
    expect(communesEnParametres([])).toStrictEqual({
      communes: null,
      page: null,
    })
  })

  it('écrit le rôle et revient à la première page', () => {
    expect(roleEnParametres('coordinateur')).toStrictEqual({
      role: 'coordinateur',
      page: null,
    })
  })

  it('retire le rôle', () => {
    expect(roleEnParametres('')).toStrictEqual({ role: null, page: null })
  })

  it("retire la valeur d'une étiquette et garde les autres", () => {
    expect(
      sansLEtiquette(new URLSearchParams('communes=15014,15187'), {
        parametre: 'communes',
        valeur: '15014',
      }),
    ).toStrictEqual({ communes: '15187', page: null })
  })

  it('retire le paramètre quand c’était la dernière valeur', () => {
    expect(
      sansLEtiquette(new URLSearchParams('role=coordinateur'), {
        parametre: 'role',
        valeur: 'coordinateur',
      }),
    ).toStrictEqual({ role: null, page: null })
  })
})
