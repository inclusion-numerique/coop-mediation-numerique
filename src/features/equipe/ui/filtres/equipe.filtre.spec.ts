import { Search, Sort } from '@arckit/resultset'
import { describe, expect, it } from 'vitest'
import { criteresDeLEquipe } from './equipe.filtre'

describe('critères de recherche dans une équipe', () => {
  it('trie par statut croissant par défaut', () => {
    expect(criteresDeLEquipe({})).toEqual({
      recherche: Search(''),
      statuts: [],
      role: null,
      tri: Sort('statut', 'asc'),
    })
  })

  it('ne retient que les statuts connus', () => {
    expect(
      criteresDeLEquipe({ statut: 'actifs,1=1); DROP TABLE users;--,archives' })
        .statuts,
    ).toEqual(['actifs', 'archives'])
  })

  it('ignore une recherche vide', () => {
    expect(criteresDeLEquipe({ recherche: '   ' }).recherche).toBe('')
  })

  it('garde une recherche telle quelle, sans l’interpréter', () => {
    expect(criteresDeLEquipe({ recherche: "o'brien%" }).recherche).toBe(
      "o'brien%",
    )
  })

  it('retombe sur le tri par défaut pour une colonne et un sens inconnus', () => {
    expect(
      criteresDeLEquipe({ tri: 'mot_de_passe', ordre: 'n’importe' }).tri,
    ).toEqual(Sort('statut', 'asc'))
  })
})
