import { describe, expect, it } from 'vitest'
import { criteresDeLEquipe } from './equipe.filtre'

describe('critères de recherche dans une équipe', () => {
  it('trie par statut croissant par défaut', () => {
    expect(criteresDeLEquipe({})).toEqual({
      recherche: null,
      statuts: [],
      role: null,
      tri: 'statut',
      ordre: 'asc',
    })
  })

  it('ne retient que les statuts connus', () => {
    expect(
      criteresDeLEquipe({ statut: 'actifs,1=1); DROP TABLE users;--,archives' })
        .statuts,
    ).toEqual(['actifs', 'archives'])
  })

  it('ignore une recherche vide', () => {
    expect(criteresDeLEquipe({ recherche: '   ' }).recherche).toBeNull()
  })

  it('garde une recherche telle quelle, sans l’interpréter', () => {
    expect(criteresDeLEquipe({ recherche: "o'brien%" }).recherche).toBe(
      "o'brien%",
    )
  })

  it('retombe sur les valeurs par défaut pour un tri inconnu', () => {
    expect(
      criteresDeLEquipe({ tri: 'mot_de_passe', ordre: 'n’importe' }),
    ).toEqual(expect.objectContaining({ tri: 'statut', ordre: 'asc' }))
  })
})
