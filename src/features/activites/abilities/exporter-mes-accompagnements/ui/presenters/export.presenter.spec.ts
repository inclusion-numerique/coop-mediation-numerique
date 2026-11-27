import { describe, expect, it } from 'vitest'
import { libelleDuMediateur } from './export.presenter'

describe('libellé d’un médiateur filtré dans l’export', () => {
  it.each<{ cas: string; ancien: boolean; libelle: string }>([
    {
      cas: 'nomme un membre par son nom',
      ancien: false,
      libelle: 'Ada Lovelace',
    },
    {
      cas: 'signale un ancien membre',
      ancien: true,
      libelle: 'Ancien membre - Ada Lovelace',
    },
  ])('$cas', ({ ancien, libelle }) => {
    expect(libelleDuMediateur({ nom: 'Ada Lovelace', ancien })).toBe(libelle)
  })
})
