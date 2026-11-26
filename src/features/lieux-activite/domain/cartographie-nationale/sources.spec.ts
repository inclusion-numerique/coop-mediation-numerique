import { describe, expect, it } from 'vitest'
import { libelleDeLaSource } from './sources'

describe('libellé d’une source de la cartographie nationale', () => {
  it.each<[string, string, string]>([
    ['nomme une source connue par son libellé', 'fredo', 'Fredo'],
    [
      'reprend tel quel le nom d’une source inconnue',
      'Nouvelle source',
      'Nouvelle source',
    ],
  ])('%s', (_cas, source, libelle) => {
    expect(libelleDeLaSource(source)).toBe(libelle)
  })
})
