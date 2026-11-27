import { describe, expect, it } from 'vitest'
import { demandeurDeLExport } from './demandeur-de-l-export.transfer'

const moi = 'a0000000-0000-4000-8000-000000000001'
const coordonne = 'a0000000-0000-4000-8000-000000000002'
const ancien = 'a0000000-0000-4000-8000-000000000003'

const coordination = {
  mediateursCoordonnes: [{ mediateurId: coordonne }],
  ancienMediateursCoordonnes: [{ mediateurId: ancien }],
}

describe("demandeur de l'export", () => {
  it('se lit d’un médiateur qui coordonne', () => {
    expect(
      demandeurDeLExport({
        mediateur: { id: moi },
        coordinateur: coordination,
      }),
    ).toEqual({
      _tag: 'MediateurEtCoordinateur',
      mediateurId: moi,
      coordonnes: [coordonne, ancien],
    })
  })

  it('se lit d’un médiateur seul', () => {
    expect(
      demandeurDeLExport({ mediateur: { id: moi }, coordinateur: null }),
    ).toEqual({ _tag: 'Mediateur', mediateurId: moi })
  })

  it('se lit d’un coordinateur seul', () => {
    expect(
      demandeurDeLExport({ mediateur: null, coordinateur: coordination }),
    ).toEqual({ _tag: 'Coordinateur', coordonnes: [coordonne, ancien] })
  })

  it('n’existe pas pour un compte ni médiateur ni coordinateur', () => {
    expect(
      demandeurDeLExport({ mediateur: null, coordinateur: null }),
    ).toBeNull()
  })
})
