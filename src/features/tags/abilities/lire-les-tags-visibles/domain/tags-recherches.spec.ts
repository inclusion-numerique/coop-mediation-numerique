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

const demarches = tag(1, 'Démarches en ligne')

describe('recherche de tags', () => {
  it('trouve un tag par son nom, sans tenir compte des accents', () => {
    expect(
      tagsRecherches([demarches, tag(2, 'Parentalité')], 'demarche'),
    ).toStrictEqual([demarches])
  })

  it('ne rend que les dix premiers', () => {
    expect(
      tagsRecherches(
        [
          tag(0, 'Tag 0'),
          tag(1, 'Tag 1'),
          tag(2, 'Tag 2'),
          tag(3, 'Tag 3'),
          tag(4, 'Tag 4'),
          tag(5, 'Tag 5'),
          tag(6, 'Tag 6'),
          tag(7, 'Tag 7'),
          tag(8, 'Tag 8'),
          tag(9, 'Tag 9'),
          tag(10, 'Tag 10'),
        ],
        'tag',
      ),
    ).toHaveLength(10)
  })
})
