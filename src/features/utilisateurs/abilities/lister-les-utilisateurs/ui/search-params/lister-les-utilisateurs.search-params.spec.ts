import { describe, expect, it } from 'vitest'
import { etatDeLaTable } from './lister-les-utilisateurs.search-params'

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
