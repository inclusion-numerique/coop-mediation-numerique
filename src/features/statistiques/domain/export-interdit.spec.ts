import { describe, expect, it } from 'vitest'
import { exportInterdit } from './export-interdit'

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

const coordinateurSeul = { ...mediateurCoordinateur, mediateur: null }

const mediateurSeul = { ...mediateurCoordinateur, coordinateur: null }

describe('export interdit', () => {
  it("autorise l'export sans médiateur demandé", () => {
    expect(exportInterdit(mediateurCoordinateur, undefined)).toBe(false)
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

  it("interdit l'export qui mêle un médiateur autorisé et un autre", () => {
    expect(exportInterdit(mediateurCoordinateur, [coordonne, autre])).toBe(true)
  })

  it('autorise un médiateur sans coordination à exporter ses statistiques', () => {
    expect(exportInterdit(mediateurSeul, [moi])).toBe(false)
  })

  it("interdit à un médiateur sans coordination d'exporter un autre médiateur", () => {
    expect(exportInterdit(mediateurSeul, [coordonne])).toBe(true)
  })

  it('autorise un coordinateur à exporter un médiateur coordonné', () => {
    expect(exportInterdit(coordinateurSeul, [coordonne])).toBe(false)
  })

  it("interdit à un coordinateur d'exporter un médiateur hors de son équipe", () => {
    expect(exportInterdit(coordinateurSeul, [autre])).toBe(true)
  })
})
