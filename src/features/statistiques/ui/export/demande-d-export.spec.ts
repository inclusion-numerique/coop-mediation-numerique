import { describe, expect, it } from 'vitest'
import { exportInterdit, filtresDeLExport } from './demande-d-export'

const moi = 'a0000000-0000-4000-8000-000000000001'
const coordonne = 'a0000000-0000-4000-8000-000000000002'
const ancien = 'a0000000-0000-4000-8000-000000000003'
const autre = 'a0000000-0000-4000-8000-000000000004'

const mediateurCoordinateur = {
  mediateur: { id: moi },
  coordinateur: {
    mediateursCoordonnes: [{ mediateurId: coordonne }],
    ancienMediateursCoordonnes: [{ mediateurId: ancien }],
  },
}

describe("filtres de l'export", () => {
  it('refuse des paramètres invalides', () => {
    expect(filtresDeLExport({ du: '30/06/2026' })).toBeNull()
  })

  it('lit des paramètres valides', () => {
    expect(filtresDeLExport({ du: '2026-01-01' })).toStrictEqual({
      du: '2026-01-01',
    })
  })
})

describe('export interdit', () => {
  it("autorise l'export sans médiateur demandé", () => {
    expect(exportInterdit(mediateurCoordinateur, undefined)).toBe(false)
  })

  it("autorise l'export d'un demandeur qui n'est pas médiateur", () => {
    expect(
      exportInterdit({ mediateur: null, coordinateur: null }, [autre]),
    ).toBe(false)
  })

  it("autorise l'export de ses propres statistiques", () => {
    expect(exportInterdit(mediateurCoordinateur, [moi])).toBe(false)
  })

  it("autorise l'export d'un médiateur coordonné", () => {
    expect(exportInterdit(mediateurCoordinateur, [coordonne])).toBe(false)
  })

  it("autorise l'export d'un ancien médiateur coordonné", () => {
    expect(exportInterdit(mediateurCoordinateur, [ancien])).toBe(false)
  })

  it("interdit l'export d'un autre médiateur", () => {
    expect(exportInterdit(mediateurCoordinateur, [autre])).toBe(true)
  })
})
