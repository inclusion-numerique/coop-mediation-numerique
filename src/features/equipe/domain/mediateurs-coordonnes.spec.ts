import { describe, expect, it } from 'vitest'
import {
  mediateurCoordonnesEtAnciensIdsFor,
  mediateurCoordonnesIdsFor,
} from '@/features/equipe/domain/mediateurs-coordonnes'

const ACTUEL = 'mediateur-actuel'
const ANCIEN = 'mediateur-ancien'
const REINVITE = 'mediateur-reinvite'

describe('mediateurCoordonnesIdsFor', () => {
  it("rend les membres actuels de l'équipe", () => {
    expect(
      mediateurCoordonnesIdsFor({
        coordinateur: { mediateursCoordonnes: [{ mediateurId: ACTUEL }] },
      }),
    ).toEqual([ACTUEL])
  })

  it("ne rend personne pour un compte qui n'est pas coordinateur", () => {
    expect(mediateurCoordonnesIdsFor({ coordinateur: null })).toEqual([])
  })
})

describe('mediateurCoordonnesEtAnciensIdsFor', () => {
  it('rend une seule fois un médiateur réinvité, présent parmi les actuels et les anciens', () => {
    expect(
      mediateurCoordonnesEtAnciensIdsFor({
        coordinateur: {
          mediateursCoordonnes: [
            { mediateurId: ACTUEL },
            { mediateurId: REINVITE },
          ],
          ancienMediateursCoordonnes: [
            { mediateurId: ANCIEN },
            { mediateurId: REINVITE },
          ],
        },
      }),
    ).toEqual([ACTUEL, REINVITE, ANCIEN])
  })

  it("ne rend personne pour un compte qui n'est pas coordinateur", () => {
    expect(mediateurCoordonnesEtAnciensIdsFor({ coordinateur: null })).toEqual(
      [],
    )
  })
})
