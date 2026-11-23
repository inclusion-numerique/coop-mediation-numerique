import { describe, expect, it } from 'vitest'
import { ordreDesUtilisateurs } from './tri-des-utilisateurs'

describe('ordreDesUtilisateurs', () => {
  it('trie par date de création décroissante sans tri demandé', () => {
    expect(ordreDesUtilisateurs({ ordre: 'asc' })).toStrictEqual([
      { created: 'desc' },
    ])
  })

  it('trie par la colonne demandée dans l’ordre demandé', () => {
    expect(
      ordreDesUtilisateurs({ tri: 'courriel', ordre: 'desc' }),
    ).toStrictEqual([{ email: 'desc' }])
  })

  it('trie par ordre croissant sans ordre demandé', () => {
    expect(ordreDesUtilisateurs({ tri: 'nom' })).toStrictEqual([
      { name: 'asc' },
    ])
  })

  it('ne trie pas sur une colonne qui n’est pas triable', () => {
    expect(ordreDesUtilisateurs({ tri: 'statut' })).toStrictEqual([])
  })
})
