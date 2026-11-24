import { Sort } from '@arckit/resultset'
import { describe, expect, it } from 'vitest'
import { ordreDesUtilisateurs } from './tri-des-utilisateurs'

describe('ordreDesUtilisateurs', () => {
  it('trie par la colonne demandée dans l’ordre demandé', () => {
    expect(ordreDesUtilisateurs(Sort('courriel', 'desc'))).toStrictEqual([
      { email: 'desc' },
    ])
  })

  it('trie par date de création', () => {
    expect(ordreDesUtilisateurs(Sort('creation', 'desc'))).toStrictEqual([
      { created: 'desc' },
    ])
  })
})
