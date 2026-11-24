import { describe, expect, it } from 'vitest'
import {
  choixEnParametres,
  etatDeLaTable,
  historiqueEnParametres,
  listeEnParametres,
  sansLaValeur,
} from './lister-les-utilisateurs.search-params'

describe('etatDeLaTable', () => {
  it('garde les filtres pour les liens de tri et de pagination', () => {
    expect(
      etatDeLaTable({ recherche: 'dupont', roles: 'mediateur', tri: 'nom' }),
    ).toStrictEqual({
      recherche: 'dupont',
      roles: 'mediateur',
      tri: 'nom',
      ordre: undefined,
    })
  })

  it('écarte un ordre de tri inconnu', () => {
    expect(etatDeLaTable({ ordre: 'n-importe' }).ordre).toBeUndefined()
  })

  it('garde un ordre de tri décroissant', () => {
    expect(etatDeLaTable({ ordre: 'desc' }).ordre).toBe('desc')
  })
})

describe('écriture des filtres des utilisateurs', () => {
  it('écrit un choix unique et revient à la première page', () => {
    expect(choixEnParametres('statut', 'actif')).toStrictEqual({
      statut: 'actif',
      page: null,
    })
  })

  it('écrit une liste et revient à la première page', () => {
    expect(listeEnParametres('roles', ['admin', 'support'])).toStrictEqual({
      roles: 'admin,support',
      page: null,
    })
  })

  it('écrit les anciens rattachements', () => {
    expect(historiqueEnParametres(true)).toStrictEqual({
      historique: '1',
      page: null,
    })
  })

  it("retire une valeur d'un filtre", () => {
    expect(
      sansLaValeur(
        new URLSearchParams('roles=admin,support'),
        'roles',
        'admin',
      ),
    ).toStrictEqual({ roles: 'support' })
  })
})
