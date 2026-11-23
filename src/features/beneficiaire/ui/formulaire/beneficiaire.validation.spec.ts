import { describe, expect, it } from 'vitest'
import { BeneficiaireValidation } from './beneficiaire.validation'

const telephoneSaisi = (telephone: string | null) =>
  BeneficiaireValidation.shape.telephone.safeParse(telephone)

describe('téléphone du bénéficiaire', () => {
  it('normalise un numéro français', () => {
    expect(telephoneSaisi('04 55 66 77 88').data).toBe('+33455667788')
  })

  it('accepte un numéro étranger', () => {
    expect(telephoneSaisi('+32 470 12 34 56').data).toBe('+32470123456')
  })

  it('ramène une saisie vide à une absence de numéro', () => {
    expect(telephoneSaisi('  ').data).toBeNull()
  })

  it('accepte une absence de numéro', () => {
    expect(telephoneSaisi(null).success).toBe(true)
  })

  it('refuse un numéro invalide', () => {
    expect(telephoneSaisi('06 52 18').success).toBe(false)
  })
})
