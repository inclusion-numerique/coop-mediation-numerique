import { criteresEquipe } from './criteres-equipe'

describe('critères de recherche dans une équipe', () => {
  it('trie par statut croissant par défaut', () => {
    expect(criteresEquipe({})).toEqual({
      recherche: null,
      statuts: [],
      role: null,
      tri: 'statut',
      ordre: 'asc',
    })
  })

  it('ne retient que les statuts connus', () => {
    expect(
      criteresEquipe({ statut: 'actifs,1=1); DROP TABLE users;--,archives' })
        .statuts,
    ).toEqual(['actifs', 'archives'])
  })

  it('ignore une recherche vide', () => {
    expect(criteresEquipe({ recherche: '   ' }).recherche).toBeNull()
  })

  it('garde une recherche telle quelle, sans l’interpréter', () => {
    expect(criteresEquipe({ recherche: "o'brien%" }).recherche).toBe("o'brien%")
  })

  it('retombe sur les valeurs par défaut pour un tri inconnu', () => {
    expect(criteresEquipe({ tri: 'mot_de_passe', ordre: 'n’importe' })).toEqual(
      expect.objectContaining({ tri: 'statut', ordre: 'asc' }),
    )
  })
})
