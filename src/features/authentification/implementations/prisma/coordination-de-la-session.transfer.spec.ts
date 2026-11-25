import { describe, expect, it } from 'vitest'
import { splitMediateursCoordonnes } from './coordination-de-la-session.transfer'

const ACTUEL = 'mediateur-actuel'
const ANCIEN = 'mediateur-ancien'

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
