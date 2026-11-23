import { describe, expect, it } from 'vitest'
import { requeteDeLaListe } from './requete-de-la-liste.search-params'

describe('requête de la liste de l’équipe', () => {
  it('commence à la première page de la taille par défaut', () => {
    expect(requeteDeLaListe({})).toEqual({
      criteres: {
        recherche: null,
        statuts: [],
        role: null,
        tri: 'statut',
        ordre: 'asc',
      },
      page: 1,
      lignesParPage: 50,
    })
  })

  it('lit la page demandée', () => {
    expect(requeteDeLaListe({ page: '3' }).page).toBe(3)
  })

  it('lit le nombre de lignes demandé', () => {
    expect(requeteDeLaListe({ lignes: '20' }).lignesParPage).toBe(20)
  })

  it('ignore une page illisible', () => {
    expect(requeteDeLaListe({ page: 'abc' }).page).toBe(1)
  })
})
