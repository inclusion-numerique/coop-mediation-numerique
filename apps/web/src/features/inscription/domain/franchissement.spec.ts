import {
  dateDeFranchissement,
  estFranchi,
  Franchissement,
} from './franchissement'

const now = new Date('2026-04-29T10:00:00Z')

describe('Franchissement', () => {
  it("construit « franchi » à partir d'une date", () => {
    expect(Franchissement(now)).toEqual({ _tag: 'franchi', le: now })
  })

  it('construit « à franchir » à partir de null', () => {
    expect(Franchissement(null)).toEqual({ _tag: 'aFranchir' })
  })

  it('construit « à franchir » à partir de undefined', () => {
    expect(Franchissement(undefined)).toEqual({ _tag: 'aFranchir' })
  })

  it('estFranchi distingue les deux variantes', () => {
    expect(estFranchi(Franchissement(now))).toBe(true)
    expect(estFranchi(Franchissement(null))).toBe(false)
  })

  it('dateDeFranchissement renvoie la date ou null', () => {
    expect(dateDeFranchissement(Franchissement(now))).toBe(now)
    expect(dateDeFranchissement(Franchissement(null))).toBeNull()
  })
})
