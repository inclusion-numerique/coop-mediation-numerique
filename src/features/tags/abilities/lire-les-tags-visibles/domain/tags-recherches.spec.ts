import { describe, expect, it } from 'vitest'
import { NomDuTag, type Tag, TagId } from '../../../domain'
import { tagsRecherches } from './tags-recherches'

const tag = (rang: number, nom: string): Tag => ({
  id: TagId(
    `0b3c4f62-2d6a-4f6e-9a39-3a4c8f1d2e${String(rang).padStart(2, '0')}`,
  ),
  nom: NomDuTag(nom),
  description: null,
  portee: { _tag: 'National' },
})

describe('recherche de tags', () => {
  it('trouve un tag par son nom, sans tenir compte des accents', () => {
    expect(
      tagsRecherches(
        [tag(1, 'Démarches en ligne'), tag(2, 'Parentalité')],
        'demarche',
      ).map(({ nom }) => nom),
    ).toStrictEqual(['Démarches en ligne'])
  })

  it('ne rend que les dix premiers', () => {
    expect(
      tagsRecherches(
        Array.from({ length: 12 }, (_, rang) => tag(rang, `Tag ${rang}`)),
        'tag',
      ),
    ).toHaveLength(10)
  })
})
