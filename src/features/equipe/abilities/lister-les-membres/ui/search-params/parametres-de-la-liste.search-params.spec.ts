import { describe, expect, it } from 'vitest'
import {
  roleEnParametres,
  sansLesFiltres,
  statutBascule,
  statutsChoisis,
} from './parametres-de-la-liste.search-params'

describe('paramètres de la liste de l’équipe', () => {
  it('écrit le rôle et revient à la première page', () => {
    expect(roleEnParametres('mediateur-numerique')).toStrictEqual({
      role: 'mediateur-numerique',
      page: null,
    })
  })

  it('retire le rôle', () => {
    expect(roleEnParametres('')).toStrictEqual({ role: null, page: null })
  })

  it('lit les statuts valides', () => {
    expect(
      statutsChoisis(new URLSearchParams('statut=actifs,inconnu')),
    ).toStrictEqual(['actifs'])
  })

  it('ajoute un statut absent', () => {
    expect(
      statutBascule(new URLSearchParams('statut=actifs'), 'inactifs'),
    ).toStrictEqual({ statut: 'actifs,inactifs', page: null })
  })

  it('retire un statut présent', () => {
    expect(
      statutBascule(new URLSearchParams('statut=actifs'), 'actifs'),
    ).toStrictEqual({ statut: null, page: null })
  })

  it('retire tous les filtres', () => {
    expect(sansLesFiltres()).toStrictEqual({
      statut: null,
      role: null,
      page: null,
    })
  })
})
