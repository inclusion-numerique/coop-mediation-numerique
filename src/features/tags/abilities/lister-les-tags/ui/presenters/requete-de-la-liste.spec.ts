import { describe, expect, it } from 'vitest'
import { requeteDeLaListe } from './requete-de-la-liste'

describe('requête de la liste des tags', () => {
  it('trie par ordre alphabétique sur la première page par défaut', () => {
    expect(requeteDeLaListe({})).toEqual({
      tri: 'alphabetique',
      page: 1,
      lignesParPage: 50,
    })
  })

  it('lit la page demandée', () => {
    expect(requeteDeLaListe({ page: '2' }).page).toBe(2)
  })

  it('lit le nombre de lignes demandé', () => {
    expect(requeteDeLaListe({ lignes: '20' }).lignesParPage).toBe(20)
  })
})
