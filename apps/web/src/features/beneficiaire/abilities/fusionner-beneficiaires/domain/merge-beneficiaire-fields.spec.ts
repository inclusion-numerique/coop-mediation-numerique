import {
  isValuePresent,
  type MergeableBeneficiaire,
  mergeBeneficiaireFields,
} from './merge-beneficiaire-fields'

const empty: MergeableBeneficiaire = {
  prenom: null,
  nom: null,
  telephone: null,
  email: null,
  adresse: null,
  commune: null,
  communeCodePostal: null,
  communeCodeInsee: null,
  notes: null,
  pasDeTelephone: null,
  anneeNaissance: null,
  rdvServicePublicId: null,
  rdvUserId: null,
  genre: null,
  trancheAge: null,
  statutSocial: null,
}

describe('isValuePresent', () => {
  test.each([
    { value: null, expected: false },
    { value: undefined, expected: false },
    { value: '', expected: false },
    { value: '   ', expected: false },
    { value: 'Jean', expected: true },
    { value: 0, expected: true },
    { value: false, expected: true },
  ])('returns $expected for $value', ({ value, expected }) => {
    expect(isValuePresent(value)).toBe(expected)
  })
})

describe('mergeBeneficiaireFields', () => {
  it('keeps the destination value when it is present', () => {
    const merged = mergeBeneficiaireFields(
      { ...empty, prenom: 'Source' },
      { ...empty, prenom: 'Destination' },
    )

    expect(merged.prenom).toBe('Destination')
  })

  it('fills from the source when the destination value is absent', () => {
    const merged = mergeBeneficiaireFields(
      { ...empty, prenom: 'Source' },
      { ...empty, prenom: null },
    )

    expect(merged.prenom).toBe('Source')
  })

  it('treats a blank destination string as absent and fills from the source', () => {
    const merged = mergeBeneficiaireFields(
      { ...empty, nom: 'Dupont' },
      { ...empty, nom: '   ' },
    )

    expect(merged.nom).toBe('Dupont')
  })

  it('omits a field that is absent in both source and destination', () => {
    const merged = mergeBeneficiaireFields(empty, empty)

    expect('prenom' in merged).toBe(false)
    expect(merged.prenom).toBeUndefined()
  })

  it('keeps a falsy-but-present destination value (false, 0)', () => {
    const merged = mergeBeneficiaireFields(
      { ...empty, pasDeTelephone: true, anneeNaissance: 1990 },
      { ...empty, pasDeTelephone: false, anneeNaissance: 0 },
    )

    expect(merged.pasDeTelephone).toBe(false)
    expect(merged.anneeNaissance).toBe(0)
  })

  it('merges each field independently (destination wins per field, source fills the gaps)', () => {
    const merged = mergeBeneficiaireFields(
      { ...empty, prenom: 'Marie', nom: 'Martin', email: 'marie@example.com' },
      { ...empty, prenom: 'Jeanne', nom: null, telephone: '+33600000000' },
    )

    expect(merged).toEqual({
      prenom: 'Jeanne',
      nom: 'Martin',
      email: 'marie@example.com',
      telephone: '+33600000000',
    })
  })
})
