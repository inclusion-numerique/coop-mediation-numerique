import { describe, expect, it } from 'vitest'
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

  it('estFranchi reconnaît une étape franchie', () => {
    expect(estFranchi(Franchissement(now))).toBe(true)
  })

  it('estFranchi reconnaît une étape à franchir', () => {
    expect(estFranchi(Franchissement(null))).toBe(false)
  })

  it('dateDeFranchissement renvoie la date d’une étape franchie', () => {
    expect(dateDeFranchissement(Franchissement(now))).toBe(now)
  })

  it('dateDeFranchissement renvoie null pour une étape à franchir', () => {
    expect(dateDeFranchissement(Franchissement(null))).toBeNull()
  })
})
