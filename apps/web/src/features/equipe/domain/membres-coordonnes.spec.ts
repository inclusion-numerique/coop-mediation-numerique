import {
  mediateurCoordonnesEtAnciensIdsFor,
  mediateurCoordonnesIdsFor,
  splitMediateursCoordonnes,
} from './membres-coordonnes'

const ACTUEL = 'mediateur-actuel'
const ANCIEN = 'mediateur-ancien'
const REINVITE = 'mediateur-reinvite'

describe('splitMediateursCoordonnes', () => {
  it('sépare les membres actuels des anciens et garde le reste du coordinateur', () => {
    expect(
      splitMediateursCoordonnes({
        id: 'coordinateur',
        mediateursCoordonnes: [
          { mediateurId: ACTUEL, suppression: null },
          { mediateurId: ANCIEN, suppression: new Date('2026-01-01') },
        ],
      }),
    ).toEqual({
      id: 'coordinateur',
      mediateursCoordonnes: [{ mediateurId: ACTUEL }],
      ancienMediateursCoordonnes: [{ mediateurId: ANCIEN }],
    })
  })

  it("ne rend rien pour un compte qui n'est pas coordinateur", () => {
    expect(splitMediateursCoordonnes(null)).toBeNull()
  })
})

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
})
