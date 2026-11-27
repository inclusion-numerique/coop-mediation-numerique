import { describe, expect, it } from 'vitest'
import { CoordinateurId, MediateurId } from '../../../../domain'
import { demandeurDe } from './demandeur.transfer'

const moi = '6c1f4a3e-2f7b-4c55-9a0e-1d2b3c4d5e6f'
const membre = '7d2a5b4f-3a8c-4d66-8b1f-2e3c4d5e6f70'
const coordinateur = 'a05d8e7c-6dbf-4a99-9e4c-516f70819203'

describe("demandeur de l'export", () => {
  it('reconnaît un médiateur seul', () => {
    expect(
      demandeurDe({ mediateurId: moi, coordinateurId: null, equipe: [] }),
    ).toStrictEqual({
      mediateurId: MediateurId(moi),
      coordinateurId: null,
      equipe: [],
    })
  })

  it('reconnaît un coordinateur et son équipe', () => {
    expect(
      demandeurDe({
        mediateurId: null,
        coordinateurId: coordinateur,
        equipe: [membre],
      }),
    ).toStrictEqual({
      mediateurId: null,
      coordinateurId: CoordinateurId(coordinateur),
      equipe: [MediateurId(membre)],
    })
  })

  it('tient pour absents les identifiants illisibles', () => {
    expect(
      demandeurDe({
        mediateurId: 'invalide',
        coordinateurId: 'invalide',
        equipe: ['invalide', membre],
      }),
    ).toStrictEqual({
      mediateurId: null,
      coordinateurId: null,
      equipe: [MediateurId(membre)],
    })
  })
})
