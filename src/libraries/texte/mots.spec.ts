import { describe, expect, it } from 'vitest'
import { motsDe } from './mots'

describe('mots d’un texte', () => {
  it('sépare les mots en ignorant les espaces répétés', () => {
    expect(motsDe(' jean  dupont ')).toStrictEqual(['jean', 'dupont'])
  })

  it('ne rend aucun mot pour un texte vide', () => {
    expect(motsDe('')).toStrictEqual([])
  })
})
