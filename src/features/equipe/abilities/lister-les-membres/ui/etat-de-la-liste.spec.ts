import { describe, expect, it } from 'vitest'
import { etatDeLaListe } from './etat-de-la-liste'

describe('état de la liste de l’équipe', () => {
  it('garde les filtres de statut et de rôle pour les liens de tri et de pagination', () => {
    expect(
      etatDeLaListe({ statut: 'actifs,inactifs', role: 'mediateur-numerique' }),
    ).toEqual({ statut: 'actifs,inactifs', role: 'mediateur-numerique' })
  })

  it('reprend la recherche, le tri, la page et le nombre de lignes', () => {
    expect(
      etatDeLaListe({
        recherche: 'camille',
        tri: 'membre',
        ordre: 'desc',
        page: '2',
        lignes: '50',
      }),
    ).toEqual({
      recherche: 'camille',
      tri: 'membre',
      ordre: 'desc',
      page: '2',
      lignes: '50',
    })
  })

  it('ignore un ordre de tri inconnu', () => {
    expect(etatDeLaListe({ tri: 'statut', ordre: 'n-importe' })).toEqual({
      tri: 'statut',
    })
  })
})
