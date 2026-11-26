import { describe, expect, it } from 'vitest'
import {
  bornesEnMinutes,
  TrancheDeDuree,
  tranchesDeDuree,
} from './tranche-de-duree'

describe('tranches de durée', () => {
  it('vont de la plus courte à la plus longue', () => {
    expect(tranchesDeDuree).toEqual([
      TrancheDeDuree('MoinsDe30Minutes'),
      TrancheDeDuree('De30MinutesA1Heure'),
      TrancheDeDuree('De1HeureA2Heures'),
      TrancheDeDuree('DeuxHeuresEtPlus'),
    ])
  })

  it.each<{
    readonly tranche: TrancheDeDuree
    readonly depuis: number
    readonly jusqua: number | null
  }>([
    { tranche: TrancheDeDuree('MoinsDe30Minutes'), depuis: 0, jusqua: 30 },
    { tranche: TrancheDeDuree('De30MinutesA1Heure'), depuis: 30, jusqua: 60 },
    { tranche: TrancheDeDuree('De1HeureA2Heures'), depuis: 60, jusqua: 120 },
    { tranche: TrancheDeDuree('DeuxHeuresEtPlus'), depuis: 120, jusqua: null },
  ])(
    '$tranche commence où la précédente s’arrête, à $depuis minutes',
    ({ tranche, depuis, jusqua }) => {
      expect(bornesEnMinutes(tranche)).toEqual({ depuis, jusqua })
    },
  )
})
