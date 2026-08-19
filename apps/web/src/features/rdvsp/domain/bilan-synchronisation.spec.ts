import {
  type BilanModele,
  bilanSynchronisationVide,
  bilanVide,
  cumulerBilans,
  derive,
  deriveTotale,
} from './bilan-synchronisation'

const bilan = (surcharge: Partial<BilanModele> = {}): BilanModele => ({
  ...bilanVide,
  ...surcharge,
})

describe('derive', () => {
  it('ne compte rien quand rien n’a changé', () => {
    expect(derive(bilan({ noop: 42 }))).toBe(0)
  })

  it('additionne créations, mises à jour et suppressions', () => {
    expect(
      derive(bilan({ created: 2, updated: 3, deleted: 1, noop: 99 })),
    ).toBe(6)
  })
})

describe('deriveTotale', () => {
  it('est nulle sur un bilan vide', () => {
    expect(deriveTotale(bilanSynchronisationVide)).toBe(0)
  })

  it('cumule la dérive de tous les modèles', () => {
    const total = deriveTotale({
      ...bilanSynchronisationVide,
      rdvs: bilan({ created: 2 }),
      organisations: bilan({ updated: 1 }),
      lieux: bilan({ deleted: 3, noop: 10 }),
    })

    expect(total).toBe(6)
  })
})

describe('cumulerBilans', () => {
  it('additionne terme à terme', () => {
    expect(
      cumulerBilans(
        bilan({ noop: 1, created: 2, updated: 3, deleted: 4 }),
        bilan({ noop: 10, created: 20, updated: 30, deleted: 40 }),
      ),
    ).toEqual({ noop: 11, created: 22, updated: 33, deleted: 44 })
  })
})
